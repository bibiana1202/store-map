require('dotenv').config();
module.exports = {
  development: {
    username: process.env.DB_USER || 'storeuser',
    password: process.env.DB_PASS || 'storepw',
    database: process.env.DB_NAME || 'storedb',
    host:     process.env.DB_HOST || 'db',
    port:     Number(process.env.DB_PORT || 3306),
    dialect:  'mariadb',
    logging:  false
  }
};
