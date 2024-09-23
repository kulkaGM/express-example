// Example config
// hover over properties to show description from types if any

/**
 * @type {import("#types").Configuration}
 */
const config = {
  mysql: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "password",
    database: "database"
  },
  tables: {
    users: "users",
    services: "services",
    logs: "logs"
  },
  varChar: {
    userNameMaxLength: 50,
    userLastNameMaxLength: 50,
    companyNameMaxLength: 50,
    serviceNameMaxLength: 50,
    emailMaxLength: 255
  },
  api: {
    https: false,
    address: "127.0.0.1",
    port: 8080
  },
  admin: {
    createAdmin: true,
    name: "",
    lastName: "",
    email: "administrator@test.com",
    password: "adminpassword",
    companyName: "TheCompany",
    onlyIfDoesntExist: true
  }
};

module.exports = config;