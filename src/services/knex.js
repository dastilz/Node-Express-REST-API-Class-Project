const knex = require('knex')
const config = require('./config')

// Initialize knex with config variables
const knex_instance =
    knex({
        client: 'mysql',
        pool: {
            min: 0,
            max: 7
        },
        connection: {
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        },
    });

module.exports = knex_instance;
