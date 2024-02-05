/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable(
    'entries',
    {
      id: 'id',
      name: { type: 'varchar(256)', notNull: true },
      is_income: { type: 'boolean', notNull: true },
      amount: { type: 'float(2)', notNull: true },
      category_id: {
        type: 'integer',
        references: '"categories"',
        onDelete: 'cascade',
      },
      occurs_on: { type: 'timestamp' },
      reccuring: { type: 'boolean', notNull: true, default: false },
      reccuring_frequency: { type: 'varchar(256)' },
      reccuring_frequency_start: { type: 'timestamp' },
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
    },
    {
      constraints: {
        check:
          '(reccuring IS FALSE AND occurs_on IS NOT NULL) OR (reccuring IS TRUE AND reccuring_frequency IS NOT NULL AND reccuring_frequency_start IS NOT NULL)',
      },
    }
  )
}

exports.down = (pgm) => {
  pgm.dropTable('entries')
}
