const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.USERDB,
    host: process.env.HOST,
    password: process.env.PASS,
    database: process.env.DATABASE,
    port: process.env.PORTDB
});

module.exports = pool;