import db from '../config/db'

import { QueryResult } from 'pg'

/**
 * Creating a new entry
 * @param entry - Entry to create
 * @param user - The requesting user
 * @returns the entry if created, false if not.
 */
export const createEntry = async (
  {
    name,
    is_income,
    category_id,
    amount,
    occurs_on,
    reccuring,
    reccuring_frequency,
    reccuring_frequency_start,
  }: Entry,
  user: User
): Promise<Entry | false> => {
  const occurs_on_date = occurs_on ? new Date(occurs_on) : null
  const reccuring_frequency_start_date = reccuring_frequency_start
    ? new Date(reccuring_frequency_start)
    : null
  return db
    .query(
      ` WITH new_entry AS (
          INSERT INTO
            entries
              (name, is_income, category_id, amount, occurs_on, reccuring, reccuring_frequency, reccuring_frequency_start, user_id)
            VALUES
              ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          returning
            id,
            name,
            is_income,
            category_id,
            amount::FLOAT,
            occurs_on at time zone 'UTC' AS occurs_on,
            reccuring, 
            reccuring_frequency,
            reccuring_frequency_start,
            user_id
        )
        SELECT
          new_entry.id,
          new_entry.name,
          new_entry.is_income,
          new_entry.category_id,
          json_build_object('name', cat.name, 'color', cat.color, 'icon', cat.icon) AS category,
          new_entry.amount::FLOAT,
          new_entry.occurs_on at time zone 'UTC' AS occurs_on,
          new_entry.reccuring, 
          new_entry.reccuring_frequency,
          new_entry.reccuring_frequency_start at time zone 'UTC' AS reccuring_frequency_start
        FROM
          new_entry
        LEFT JOIN
          categories cat ON cat.id = new_entry.category_id
      `,
      [
        name,
        is_income,
        category_id,
        amount,
        occurs_on_date,
        reccuring,
        reccuring_frequency,
        reccuring_frequency_start_date,
        user.id,
      ]
    )
    .then((res: QueryResult): Entry => {
      return res.rows[0]
    })
    .catch((err) => {
      console.log(err)
      return false
    })
}

/**
 * Updating an existing entry
 * @param entry - The new entry info
 * @param user - The requesting user
 * @returns the entry if modified, false if not.
 */
export const updateEntry = async (
  {
    id,
    name,
    is_income,
    category_id,
    amount,
    occurs_on,
    reccuring,
    reccuring_frequency,
    reccuring_frequency_start,
  }: Entry,
  user: User
): Promise<Entry | false> => {
  const occurs_on_date = occurs_on ? new Date(occurs_on) : null
  const reccuring_frequency_start_date = reccuring_frequency_start
    ? new Date(reccuring_frequency_start)
    : null
  return db
    .query(
      ` WITH new_entry AS (
          UPDATE
            entries
          SET
            name = $1,
            is_income = $2,
            category_id = $3,
            amount = $4,
            occurs_on = $5,
            reccuring = $6,
            reccuring_frequency = $7,
            reccuring_frequency_start = $8
          WHERE
            user_id = $9 AND id = $10
          returning
            id,
            name,
            is_income,
            category_id,
            amount::FLOAT,
            occurs_on at time zone 'UTC' AS occurs_on,
            reccuring, 
            reccuring_frequency,
            reccuring_frequency_start,
            user_id
        )
        SELECT
          new_entry.id,
          new_entry.name,
          new_entry.is_income,
          new_entry.category_id,
          json_build_object('name', cat.name, 'color', cat.color, 'icon', cat.icon) AS category,
          new_entry.amount::FLOAT,
          new_entry.occurs_on at time zone 'UTC' AS occurs_on,
          new_entry.reccuring, 
          new_entry.reccuring_frequency,
          new_entry.reccuring_frequency_start at time zone 'UTC' AS reccuring_frequency_start
        FROM
          new_entry
        LEFT JOIN
          categories cat ON cat.id = new_entry.category_id
      `,
      [
        name,
        is_income,
        category_id,
        amount,
        occurs_on_date,
        reccuring,
        reccuring_frequency,
        reccuring_frequency_start_date,
        user.id,
        id,
      ]
    )
    .then((res: QueryResult): Entry => {
      return res.rows[0]
    })
    .catch((err) => {
      console.log(err)
      return false
    })
}

/**
 * takes a user and return its entries
 * @param user - The requesting user
 * @returns the user's entries
 */
export const getEntries = async (user: User): Promise<Entry[] | false> => {
  return db
    .query(
      ` SELECT
          entries.id,
          entries.name,
          entries.is_income,
          entries.category_id,
          json_build_object('name', cat.name, 'color', cat.color, 'icon', cat.icon) AS category,
          entries.amount::FLOAT,
          entries.occurs_on at time zone 'UTC' AS occurs_on,
          entries.reccuring, 
          entries.reccuring_frequency,
          entries.reccuring_frequency_start at time zone 'UTC' AS reccuring_frequency_start
        FROM
          entries
        LEFT JOIN
          categories cat ON cat.id = entries.category_id
        WHERE
          entries.user_id = $1
        GROUP BY
          entries.id, cat.id
      `,
      [user.id]
    )
    .then((res: QueryResult): Entry[] => {
      return res.rows
    })
    .catch((err) => {
      console.log(err)
      return false
    })
}

/**
 * takes an entry ID and a user and deletes the entry.
 * @param entryId - The entry's ID
 * @param user - The requesting user
 * @returns was the entry successfuly deleted
 */
export const deleteEntry = async (entryId: number, user: User) => {
  return db
    .query(`DELETE FROM entries WHERE id = $1 AND user_id = $2`, [
      entryId,
      user.id,
    ])
    .then((res: QueryResult) => {
      return res.rowCount > 0
    })
    .catch((err) => {
      return false
    })
}

/**
 * takes a user and return its forecast a year forward.
 * @param user - The requesting user
 * @returns the user's forecast
 */
export const getForecast = async (user: User) => {
  const entries: Entry[] | false = await getEntries(user)
  if (!entries) {
    return false
  }

  const start = user.start_amount
  const f: ForecastDateObject[] = [
    {
      date: new Date(),
      value: start as number,
      incomes: [] as any,
      outcomes: [] as any,
    },
  ]

  const forecastEntries: ForecastEntry[] = entries.map(
    (entry) => new ForecastEntry(entry, new Date())
  )

  const getNextDate = (date) => {
    const m = new Date(date)
    m.setMonth(m.getMonth() + 1)
    m.setDate(1)
    return m
  }

  for (let i = 1; i < 12; i++) {
    const m = getNextDate(f[i - 1].date)

    const incomes = []
    const outcomes = []
    for (const forecastEntry of forecastEntries) {
      const targetArray = forecastEntry.entry.is_income ? incomes : outcomes
      const occurances = forecastEntry.getOccuranceWhileInRange(
        f[i - 1].date as Date,
        m
      )
      if (occurances === 0) {
        continue
      }
      targetArray.push({
        entry: forecastEntry.entry,
        occurances,
      })
    }

    const value = parseFloat(
      (
        f[i - 1].value +
        incomes.reduce((p, v) => p + v.entry.amount * v.occurances, 0) -
        outcomes.reduce((p, v) => p + v.entry.amount * v.occurances, 0)
      ).toFixed(2)
    )

    f.push({
      date: m,
      value,
      incomes,
      outcomes,
    })
  }
  return f
}

// A class for handling forecast entries
class ForecastEntry {
  entry: Entry
  current: Date
  reccuring: boolean
  passedOccurance: boolean
  constructor(entry: Entry, start: Date) {
    this.entry = entry
    this.reccuring = entry.reccuring
    this.passedOccurance = false
    this.initializeCurrent(start)
  }
  /**
   * takes a starting date and initializing the current date for the entry
   * @param start - the date from which the forecast is starting
   * @returns void
   */
  initializeCurrent(start: Date): void {
    if (!this.reccuring) {
      this.current = new Date(this.entry.occurs_on)
      return
    }

    // Is reccuring
    this.current = new Date(this.entry.reccuring_frequency_start)
    while (this.current.getTime() < start.getTime()) {
      this.getNextOccurance()
    }
  }
  /**
   * for a reccuring entry, sets the next occurance and returns it
   * @returns the next occurance
   */
  getNextOccurance(): Date {
    const interval = parseInt(this.entry.reccuring_frequency.slice(0, -1), 10)
    const occurency = this.entry.reccuring_frequency.slice(-1)

    if (occurency === 'd') {
      this.current.setDate(this.current.getDate() + interval)
    }
    if (occurency === 'w') {
      this.current.setDate(this.current.getDate() + 7 * interval)
    }
    if (occurency === 'm') {
      this.current.setMonth(this.current.getMonth() + interval)
    }
    if (occurency === 'y') {
      this.current.setFullYear(this.current.getFullYear() + interval)
    }

    return this.current
  }
  /**
   * takes a starting date and an ending date, and iterating through occurances within that range,
   * while progressing the entry's current date.
   * @param start - The beggining date
   * @param end - The ending date
   * @returns the number of occurances within the range
   */
  getOccuranceWhileInRange(start: Date, end: Date): number {
    if (this.passedOccurance) {
      return 0
    }
    if (!this.reccuring) {
      if (
        this.current.getTime() >= start.getTime() &&
        this.current.getTime() < end.getTime()
      ) {
        this.passedOccurance = true
        return 1
      } else {
        return 0
      }
    }

    let occurances = 0
    while (
      this.current.getTime() >= start.getTime() &&
      this.current.getTime() < end.getTime()
    ) {
      occurances++
      this.getNextOccurance()
    }

    if (occurances === 1 && !this.reccuring) {
      this.passedOccurance = true
    }

    return occurances
  }
}
