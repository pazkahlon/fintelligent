/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createIndex('categories', 'user_id')
  pgm.createIndex('entries', 'user_id')
}

exports.down = (pgm) => {
  pgm.dropIndex('categories', 'user_id')
  pgm.dropIndex('entries', 'user_id')
}
