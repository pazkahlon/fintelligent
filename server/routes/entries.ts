import { NextFunction, Request, Response, Router } from 'express'
import * as Entry from '../models/entry'
import * as Category from '../models/category'

const router = Router()

/**
 * Authentication Middleware
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express Next
 * @returns void if authenticated, 401 if not.
 */
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    next()
  } else {
    return res.status(401).json()
  }
}

/**
 * Validate entry
 * @param entry - Given Entry
 * @returns is the entry given is valid
 */
const entryTypeCheck = (entry: Entry) => {
  return (
    typeof entry.name === 'string' &&
    typeof entry.is_income === 'boolean' &&
    (typeof entry.category_id === 'number' || entry.category_id === null) &&
    typeof entry.amount === 'number' &&
    (typeof entry.occurs_on === 'number' || entry.occurs_on === null) &&
    typeof entry.reccuring === 'boolean' &&
    (entry.reccuring === false ||
      typeof entry.reccuring_frequency === 'string') &&
    (entry.reccuring === false ||
      typeof entry.reccuring_frequency_start === 'number')
  )
}

router.post(
  '/create-entry',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const {
      name,
      is_income,
      category_id,
      amount,
      occurs_on,
      reccuring,
      reccuring_frequency,
      reccuring_frequency_start,
    }: Entry = req.body

    if (
      !entryTypeCheck({
        name,
        is_income,
        category_id,
        amount,
        occurs_on,
        reccuring,
        reccuring_frequency,
        reccuring_frequency_start,
      })
    ) {
      return res.status(400).json()
    }

    // If chosen category don't exist or is of another user, return 400
    if (!Category.byThisUser(category_id, req.user as User)) {
      return res.status(400).json()
    }

    const entry = await Entry.createEntry(
      {
        name,
        is_income,
        category_id,
        amount,
        occurs_on,
        reccuring,
        reccuring_frequency,
        reccuring_frequency_start,
      },
      req.user as User
    )

    if (!entry) {
      return res.status(400).json()
    }
    return res.status(200).json({ entry })
  }
)

router.post(
  '/edit-entry',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const {
      id,
      name,
      is_income,
      category_id,
      amount,
      occurs_on,
      reccuring,
      reccuring_frequency,
      reccuring_frequency_start,
    } = req.body

    if (
      !entryTypeCheck({
        name,
        is_income,
        category_id,
        amount,
        occurs_on,
        reccuring,
        reccuring_frequency,
        reccuring_frequency_start,
      })
    ) {
      return res.status(400).json()
    }

    // If chosen category don't exist or is of another user, return 400
    if (!Category.byThisUser(category_id, req.user as User)) {
      return res.status(400).json()
    }

    const entry = await Entry.updateEntry(
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
      },
      req.user as User
    )

    if (!entry) {
      return res.status(400).json()
    }
    return res.status(200).json({ entry })
  }
)

router.post(
  '/delete-entry',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { entry_id } = req.body

    if (typeof entry_id !== 'number') {
      return res.status(400).json()
    }

    const deleteEntry = await Entry.deleteEntry(entry_id, req.user as User)

    if (!deleteEntry) {
      return res.status(400).json()
    }
    return res.status(200).json({ deleteEntry })
  }
)

router.get(
  '/get-entries',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const entries = await Entry.getEntries(req.user as User)

    if (!entries) {
      return res.status(400).json()
    }
    return res.status(200).json({ entries })
  }
)

router.get(
  '/get-forecast',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const forecast = await Entry.getForecast(req.user as User)

    if (!forecast) {
      return res.status(400).json()
    }
    return res.status(200).json({ forecast })
  }
)

export default router
