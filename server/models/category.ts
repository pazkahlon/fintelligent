import db from '../config/db'

import { QueryResult } from 'pg'

/**
 * Creating a new category
 * @param category - Category to create
 * @param user - The requesting user
 * @returns the category if created, false if not.
 */
export const createCategory = async (
  { name, color, icon }: Category,
  user: User
): Promise<Category | false> => {
  return db
    .query(
      ` INSERT INTO
          categories
            (name, color, icon, user_id)
          VALUES
            ($1, $2, $3, $4)
        returning
          id, name, color, icon
      `,
      [name, color, icon, user.id]
    )
    .then((res: QueryResult): Category => {
      return res.rows[0]
    })
    .catch((err) => {
      console.log(err)
      return false
    })
}

/**
 * Updating an existing category
 * @param category - The new category info
 * @param user - The requesting user
 * @returns the category if modified, false if not.
 */
export const updateCategory = async (
  { id, name, color, icon }: Category,
  user: User
): Promise<Category | false> => {
  return db
    .query(
      ` UPDATE
          categories
        SET
          name = $1, color = $2, icon = $3
        WHERE
          id = $4 AND user_id = $5
        returning
          id, name, color, icon
      `,
      [name, color, icon, id, user.id]
    )
    .then((res: QueryResult): Category => {
      return res.rows[0]
    })
    .catch((err) => {
      console.log(err)
      return false
    })
}

/**
 * takes a category ID and a user and returns true if it was created by the user.
 * @param categoryId - The category's ID
 * @param user - The requesting user
 * @returns was the category created by the requesting user
 */
export const byThisUser = async (
  categoryId: number | null,
  user: User
): Promise<boolean> => {
  if (!categoryId) {
    return true
  }
  return db
    .query(
      'SELECT id, user_id FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, user.id]
    )
    .then((res: QueryResult): boolean => {
      return res.rows.length !== 0
    })
}

/**
 * takes a user and return its categories
 * @param user - The requesting user
 * @returns the user's categories
 */
export const getCategories = async (
  user: User
): Promise<Category[] | false> => {
  return db
    .query('SELECT id, name, color, icon FROM categories WHERE user_id = $1', [
      user.id,
    ])
    .then((res: QueryResult): Category[] => {
      return res.rows
    })
    .catch((err) => {
      return false
    })
}

/**
 * takes a category ID and a user and deletes the category.
 * @param categoryId - The category's ID
 * @param user - The requesting user
 * @returns was the category successfuly deleted
 */
export const deleteCategory = async (categoryId: number, user: User) => {
  return db
    .query(`DELETE FROM categories WHERE id = $1 AND user_id = $2`, [
      categoryId,
      user.id,
    ])
    .then((res: QueryResult) => {
      return res.rowCount > 0
    })
    .catch((err) => {
      return false
    })
}
