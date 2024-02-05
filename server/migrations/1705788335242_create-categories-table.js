/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('categories', {
    id: 'id',
    name: { type: 'varchar(256)', notNull: true },
    color: { type: 'varchar(256)', notNull: true },
    icon: { type: 'varchar(256)' },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('categories')
}
