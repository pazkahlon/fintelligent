import db from '../config/db'
import bcrypt from 'bcrypt'

import { QueryResult } from 'pg'

/**
 * takes an email and returns the user using the email if found.
 * @param email - An email address
 * @returns the user if found, false if error.
 */
export const findByEmail = async (email: string): Promise<User | false> => {
  return db
    .query(
      'SELECT id, email, display_name, display_currency, start_amount from users WHERE email = $1',
      [email]
    )
    .then((res: QueryResult): User => {
      return res.rows[0]
    })
    .catch((err) => {
      return false
    })
}

/**
 * takes an ID and returns the user with that ID.
 * @param id - A user ID
 * @returns the user if found, false if error.
 */
export const findById = async (id: number): Promise<User | false> => {
  return db
    .query(
      'SELECT id, email, display_name, display_currency, start_amount from users WHERE id = $1',
      [id]
    )
    .then((res: QueryResult): User => {
      return res.rows[0]
    })
    .catch((err) => {
      return false
    })
}

/**
 * takes a user parameters and creates a new user.
 * @param user - The user to create
 * @returns an object with the user's id if created, false if not
 */
export const createUser = async ({
  email,
  password,
  display_name,
  display_currency,
  start_amount,
}: User): Promise<false | { id: number }> => {
  if (await emailExists(email)) {
    return false
  }

  display_name ??= 'User'
  display_currency ??= 'USD'
  start_amount ??= 0

  const hashedPassword: string = await bcrypt.hash(password, 10)

  return db
    .query(
      'INSERT INTO users (email, password, display_name, display_currency, start_amount) VALUES ($1, $2, $3, $4, $5) returning id',
      [email, hashedPassword, display_name, display_currency, start_amount]
    )
    .then((res: QueryResult) => {
      return { id: res.rows[0].id }
    })
    .catch((err) => {
      console.log(err)
      return false
    })
}

/**
 * takes and email and returns true if it exists in the system, false if not.
 * @param email - An email address
 * @returns does the email exist in the system
 */
export const emailExists = async (email: string): Promise<boolean> => {
  return db
    .query('SELECT id from users WHERE email = $1', [email])
    .then((res: QueryResult): boolean => {
      return res.rows.length > 0
    })
    .catch((err) => {
      return true
    })
}

/**
 * takes the current user and a password, and returns true if the password given matches the user's actual password.
 * @param user - The requesting user
 * @param inputPassword - Input password
 * @returns is the password valid
 */
export const validatePassword = async (
  user: User,
  inputPassword: string
): Promise<boolean> => {
  return await db
    .query('SELECT password from users WHERE id = $1', [user.id])
    .then(async (res: QueryResult): Promise<boolean> => {
      const password = res.rows[0].password
      return await bcrypt.compare(inputPassword, password)
    })
    .catch((err) => {
      return false
    })
}

/**
 * takes preferences and a user, and sets the new preferences for the requesting user.
 * @param userPreferences - The new preferences
 * @param user - The requesting user
 * @returns the new preferences, false if error
 */
export const updatePreferences = async (
  { display_name, display_currency, start_amount }: UserPreferences,
  user: User
): Promise<UserPreferences | false> => {
  return db
    .query(
      ` UPDATE
          users
        SET
        display_name = $1, display_currency = $2, start_amount = $3
        WHERE
          id = $4
        returning
          display_name, display_currency, start_amount
      `,
      [display_name, display_currency, start_amount, user.id]
    )
    .then((res: QueryResult) => {
      return res.rows[0]
    })
    .catch((err) => {
      return false
    })
}

/**
 * takes a user ID deletes the user.
 *
 * @remarks
 * This function is only used inside tests in order to remove the test user after the test is finished.
 * It can be accesses outside through '/auth/delete-user' but requires email & password confirmation.
 *
 * @param userId - The user's ID
 * @returns a promise returning void.
 */
export const deleteUser = async (userId: number): Promise<void> => {
  await db.query('DELETE FROM users WHERE id = $1', [userId])
}
