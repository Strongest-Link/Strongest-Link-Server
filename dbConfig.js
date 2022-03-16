const { Pool } = require("pg");

const config = process.env.DATABASE_URL && {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
};

const pool = new Pool(config);

module.exports = pool;
