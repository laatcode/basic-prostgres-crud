require('dotenv').config()
const {Pool} = require('pg')

const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
})

pool.on('error', (err, client) => {
    console.error('Error in PostgreSQL client:', err);
    process.exit(-1);
});

module.exports = pool