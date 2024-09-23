const bcrypt = require("bcryptjs");

class Core {
  /**
   * @param {import("mysql2/promise").Connection} connection 
   * @param {import("#types").Configuration} cfg 
   */
  constructor(connection, cfg) {
    this.connection = connection;
    this.cfg = cfg;
  }
  async prepareDatabase() {
    const usersTable = this.connection.query(`CREATE TABLE IF NOT EXISTS ${this.cfg.tables.users} (
      userId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(${this.cfg.varChar.userNameMaxLength}) NOT NULL,
      lastName VARCHAR(${this.cfg.varChar.userLastNameMaxLength}) NOT NULL,
      email VARCHAR(${this.cfg.varChar.emailMaxLength}) NOT NULL UNIQUE,
      companyName VARCHAR(${this.cfg.varChar.companyNameMaxLength}) NOT NULL,
      password TEXT NOT NULL,
      isAdmin TINYINT(1) NOT NULL
      )`
    );
    const servicesTable = this.connection.query(`CREATE TABLE IF NOT EXISTS ${this.cfg.tables.services} (
      serviceId INT NOT NULL AUTO_INCREMENT,
      userId INT NOT NULL,
      name VARCHAR(${this.cfg.varChar.serviceNameMaxLength}) NOT NULL,
      PRIMARY KEY(serviceId, userId)
      )`
    );
    const logsTable = this.connection.query(`CREATE TABLE IF NOT EXISTS ${this.cfg.tables.logs} (
      logId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      address VARCHAR(45) NOT NULL,
      method VARCHAR(10) NOT NULL,
      request VARCHAR(100) NOT NULL,
      timestamp BIGINT NOT NULL)`
    );
    await Promise.all([usersTable, servicesTable, logsTable]);
  }
  /**
   * @returns {Promise<number>} Gets how many admin users are there
   */
  async getAdminCount() {
    const [q, f] = await this.connection.query(`SELECT COUNT(*) FROM ${this.cfg.tables.users} WHERE isAdmin = "1"`);
    return q[0]["COUNT(*)"];
  }
  /**
   * Gets user by userId
   * @param {Number} userId User ID
   * @param {boolean} [includePassword=false] Return user with hashed password?
   * @returns {Promise<User | null>}
   */
  async getUser(userId, includePassword = false) {
    const [q, f] = await this.connection.query(`SELECT * FROM ${this.cfg.tables.users} WHERE userId = "${userId}"`);
    if (q[0]) {
      const { name, lastName, email, companyName, password, isAdmin, userId } = q[0];
      return new User(name, lastName, email, companyName, includePassword ? password : null, isAdmin, this, userId);
    } else {
      return null;
    }
  }
  /**
   * Gets user by email
   * @param {string} email Email
   * @param {boolean} [includePassword=false] Return user with hashed password?
   * @returns {Promise<User | null>}
   */
  async getUserByEmail(email, includePassword = false) {
    const [q, f] = await this.connection.query(`SELECT * FROM ${this.cfg.tables.users} WHERE email = "${email}"`);
    if (q[0]) {
      const { name, lastName, email, companyName, password, isAdmin, userId } = q[0];
      return new User(name, lastName, email, companyName, includePassword ? password : null, isAdmin, this, userId);
    } else {
      return null;
    }
  }
  /**
   * Try to Create user if email is not already used
   * @param {string} name Name
   * @param {string} lastName Last name
   * @param {string} email Email
   * @param {string} companyName Company
   * @param {string} password Password
   * @param {boolean} isAdmin Create user with admin privileges?
   * @returns {Promise<User | string>} Returns new User with userId
   */
  async tryCreateUser(name, lastName, email, companyName, password, isAdmin) {
    const user = await this.getUserByEmail(email, false);
    if (user) {
      return `Unable to create user, email: ${email} is already in use`;
    } else {
      return await this.createUser(name, lastName, email, companyName, password, isAdmin);
    }
  }
  /**
   * Creates new user
   * @param {string} name Name
   * @param {string} lastName Last name
   * @param {string} email Email
   * @param {string} companyName Company
   * @param {string} password Password
   * @param {boolean} isAdmin Create user with admin privileges?
   * @returns {Promise<User>} Returns new User with userId
   */
  async createUser(name, lastName, email, companyName, password, isAdmin) {
    const hashedPass = await bcrypt.hash(password, 8);
    const user = new User(name, lastName, email, companyName, hashedPass, isAdmin, this, null);
    // @ts-ignore
    const [{ insertId }] = await this.connection.query(`INSERT INTO ${this.cfg.tables.users} (${Object.keys(user)}) VALUES (${Object.keys(user).map(v => "?").join(",")})`, Object.values(user));
    return new User(user.name, user.lastName, user.email, user.companyName, null, user.isAdmin, this, insertId);
  }
  /**
   * Gets user service by Id
   * @param {Number} userId
   * @param {Number} serviceId 
   * @returns {Promise<Service | null>}
   */
  async getUserService(userId, serviceId) {
    const [q, f] = await this.connection.query(`SELECT * FROM ${this.cfg.tables.services} WHERE userId = "${userId}" AND serviceId = "${serviceId}"`);
    if (q[0]) {
      return new Service(q[0].name, q[0].userId, this, q[0].serviceId);
    } else {
      return null;
    }
  }
  /**
   * Creates new service under user
   * @param {string} name name
   * @param {Number} userId user ID
   * @returns {Promise<Service>} Returns new Service with srviceId
   */
  async createService(name, userId) {
    const service = new Service(name, userId, this, null);
    // @ts-ignore
    const [{ insertId }] = await this.connection.query(`INSERT INTO ${this.cfg.tables.services} (${Object.keys(service)}) VALUES (${Object.keys(service).map(v => "?").join(",")})`, Object.values(service));
    return new Service(name, userId, this, insertId);
  }
  /**
   * 
   * @param {string} ip Adress
   * @param {string} method Method
   * @param {string} url Url
   */
  async logRequest(ip, method, url) {
    const record = new LogRecord(ip, method, url);
    this.connection.query(`INSERT INTO ${this.cfg.tables.logs} (${Object.keys(record)}) VALUES (${Object.keys(record).map(v => "?").join(",")})`, Object.values(record));
  }
}


class User {
  #core;
  /**
   * @param {string} name Name
   * @param {string} lastName Last name
   * @param {string} email Email
   * @param {string} companyName Company
   * @param {string | null} password Password
   * @param {boolean} isAdmin Create user with admin privileges?
   * @param {Core} core 
   * @param {number | null} userId 
   */
  constructor(name, lastName, email, companyName, password, isAdmin, core, userId) {
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.companyName = companyName;
    this.password = password;
    this.isAdmin = isAdmin;
    this.#core = core;
    this.userId = userId;
  }
  /**
   * Edits user
   * @returns {Promise<boolean>}
   */
  async update() {
    const [q] = await this.#core.connection.query(`REPLACE INTO ${this.#core.cfg.tables.users} (${Object.keys(this)}) VALUES (${Object.keys(this).map(v => "?").join(",")})`, Object.values(this));
    // @ts-ignore
    return q.affectedRows > 0;
  }
  /**
   * Deletes User, does not delete User services
   * @returns {Promise<boolean>}
   */
  async delete() {
    const [q, f] = await this.#core.connection.query(`DELETE FROM ${this.#core.cfg.tables.users} WHERE userId = "${this.userId}"`);
    // @ts-ignore
    return q.affectedRows > 0;
  }
  /**
   * Creates new Service
   * @param {string} name Name
   * @returns {Promise<Service>}
   */
  async createService(name) {
    const service = new Service(name, this.userId, this.#core, null);
    // @ts-ignore
    const [{ insertId }] = await this.#core.connection.query(`INSERT INTO ${this.#core.cfg.tables.services} (${Object.keys(service)}) VALUES (${Object.keys(service).map(v => "?").join(",")})`, Object.values(service));
    return new Service(name, this.userId, this.#core, insertId);
  }
  /**
   * Gets Service
   * @param {Number} serviceId 
   * @returns {Promise<Service | null>}
   */
  async getService(serviceId) {
    const [q, f] = await this.#core.connection.query(`SELECT * FROM ${this.#core.cfg.tables.services} WHERE serviceId = ${serviceId} AND userId = "${this.userId}"`);
    if (q[0]) {
      return new Service(q[0].name, q[0].userId, this.#core, q[0].serviceId);
    } else {
      return null;
    }
  }
}

class Service {
  #core;
  /**
   * 
   * @param {string} name Name
   * @param {Number} userId UserId
   * @param {Core} core 
   * @param {number | null} serviceId
   */
  constructor(name, userId, core, serviceId) {
    this.name = name;
    this.userId = userId;
    this.#core = core;
    this.serviceId = serviceId;
  }
  /**
   * Edits Service
   * @returns {Promise<boolean>}
   */
  async update() {
    const [q] = await this.#core.connection.query(`REPLACE INTO ${this.#core.cfg.tables.services} (${Object.keys(this)}) VALUES (${Object.keys(this).map(v => "?").join(",")})`, Object.values(this));
    // @ts-ignore
    return q.affectedRows > 0;
  }
  /**
   * Deletes Service
   * @returns {Promise<boolean>}
   */
  async delete() {
    const [q, f] = await this.#core.connection.query(`DELETE FROM ${this.#core.cfg.tables.services} WHERE userId = ${this.userId} AND serviceId = "${this.serviceId}"`);
    // @ts-ignore
    return q.affectedRows > 0;
  }
}

class LogRecord {
  /**
   * 
   * @param {string} ip Adress
   * @param {string} method Method
   * @param {string} url Url
   */
  constructor(ip, method, url) {
    this.address = ip;
    this.method = method;
    this.request = url;
    this.timestamp = Date.now();
  }
}

module.exports = Core;