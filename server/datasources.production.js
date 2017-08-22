'use strict';

let sqlHostname = process.env.sql_hostname;
let sqlDatabase = process.env.sql_database;
let sqlUsername = process.env.sql_username;
let sqlPassword = process.env.sql_password;

module.exports = {
  db: {
    connector: 'mysql',
    connectionLimit: 4,
    host: sqlHostname,
    port: 3306,
    database: sqlDatabase,
    username: sqlUsername,
    password: sqlPassword
  }
};
