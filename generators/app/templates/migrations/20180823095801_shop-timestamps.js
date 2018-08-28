
exports.up = function(knex, Promise) {
  return knex.schema.table('shops', (table) => {
    table.dateTime('created_at')
    table.dateTime('updated_at')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('shops', (table) => {
    table.dropColumn('updated_at')
    table.dropColumn('created_at')
  })
};
