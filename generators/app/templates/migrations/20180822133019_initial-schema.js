const {SQLStrategy} = require('@shopify/shopify-express/strategies');
const knexConfig = require('../knexfile')
const env = process.env.NODE_ENV || 'development'

exports.up = function(knex, Promise) {
  const strategy = new SQLStrategy(knexConfig[env])
  return strategy.initialize()
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('shops')
};
