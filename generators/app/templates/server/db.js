const env        = process.env.NODE_ENV || 'development'
const knexConfig = require('../knexfile')[env]
const knex       = require('knex')(knexConfig)
const bookshelf  = require('bookshelf')(knex)
const ModelBase  = require('bookshelf-modelbase')(bookshelf)
bookshelf.plugin(require('bookshelf-modelbase').pluggable)
bookshelf.plugin('case-converter')

const Shop = ModelBase.extend({
  tableName: 'shops'
})

module.exports = {
  knex,
  knexConfig,
  bookshelf,
  ModelBase,
  Shop
}
