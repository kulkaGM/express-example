/**
 * @module CoreTypes
 */

/**
* @typedef {Object} Configuration
* @prop {import("mysql2").ConnectionOptions} mysql
* @prop {TablesConfig} tables
* @prop {VarCharConfig} varChar
* @prop {ApiConfig} api
* @prop {AdminConfig} admin
*/

/**
 * @typedef {Object} AdminConfig
 * @prop {boolean} createAdmin Should create admin user
 * @prop {boolean} onlyIfDoesntExist Create admin user only if doesn't exists
 * @prop {string} name name
 * @prop {string} lastName lastName
 * @prop {string} email email
 * @prop {string} companyName companyName
 * @prop {string} password password
 */

/**
 * @typedef {Object} TablesConfig
 * @prop {string} users
 * @prop {string} services
 * @prop {string} logs
 */

/**
 * @typedef {Object} VarCharConfig
 * @prop {number} userNameMaxLength Used for check in api and also for mysql VARCHAR
 * @prop {number} userLastNameMaxLength Used for check in api and also for mysql VARCHAR
 * @prop {number} companyNameMaxLength Used for check in api and also for mysql VARCHAR
 * @prop {number} serviceNameMaxLength Used for check in api and also for mysql VARCHAR
 * @prop {number} emailMaxLength Used for check in api and also for mysql VARCHAR
 */

/**
 * @typedef {Object} ApiConfig
 * @prop {boolean} https https ?
 * @prop {string} address address `127.0.0.1`
 * @prop {number} port port `8080`
 */

module.exports = {};