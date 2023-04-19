const { Pool } = require('pg');
require('dotenv').config();

process.env.TZ = 'America/Bogota';

const pool = new Pool({
    user: process.env.USERDB,
    host: process.env.HOST,
    password: process.env.PASS,
    database: process.env.DATABASE,
    port: process.env.PORTDB
});

module.exports = pool;