/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar(256)', notNull: true, unique: true },
    password: { type: 'varchar(256)', notNull: true },
    display_name: { type: 'varchar(256)', notNull: true },
    start_amount: { type: 'float(2)', notNull: true, default: 0 },
    display_currency: { type: 'varchar(256)', notNull: true, default: '' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('users')
}
