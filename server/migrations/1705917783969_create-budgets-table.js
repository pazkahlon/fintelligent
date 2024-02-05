/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('budgets', {
    id: 'id',
    name: { type: 'varchar(256)', notNull: true },
    amount: { type: 'varchar(256)', notNull: true },
    category_id: {
      type: 'integer',
      references: '"categories"',
      onDelete: 'cascade',
      notNull: true,
    },
    frequency: { type: 'varchar(256)', notNull: true }, // weekly, monthly, or anually
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
  pgm.dropTable('budgets')
}
