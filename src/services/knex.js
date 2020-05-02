const knex = require('knex')

// Initialize knex
knex_instance =
    knex({
        client: 'mysql',
        pool: {
            min: 0,
            max: 7
        },
        connection: {
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'SMPDB'
        },
    });

module.exports = knex_instance;
