// Update with your config settings.

require('dotenv').config()

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host:     process.env.DB_HOST     || 'localhost',
      database: process.env.DB_NAME     || 'chefs_schedule',
      user:     process.env.DB_USER     || 'dbap',
      password: process.env.DB_PASSWORD || 'dbap'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host:     process.env.DB_HOST     || 'localhost',
      database: process.env.DB_NAME     || 'chefs_schedule',
      user:     process.env.DB_USER     || 'dbap',
      password: process.env.DB_PASSWORD || 'dbap'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

}
