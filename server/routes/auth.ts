import { NextFunction, Request, Response, Router } from 'express'
import passport from 'passport'
import * as User from '../models/user'
import * as Entry from '../models/entry'
import * as Category from '../models/category'

const router: Router = Router()

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

router.post('/register', async (req: Request, res: Response) => {
  const {
    email,
    password,
    display_name,
    display_currency,
    start_amount,
  }: User = req.body

  const emailRegexp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegexp.test(email)) {
    return res.status(400).json()
  }

  const registered = await User.createUser({
    email,
    password,
    display_name,
    display_currency,
    start_amount,
  })

  if (!registered) {
    return res.status(400).json()
  }
  return res.status(200).json(registered)
})

router.post(
  '/login',
  passport.authenticate('local'),
  (req: Request, res: Response) => {
    res.status(200).json()
  }
)

router.post('/logout', isAuthenticated, (req: Request, res: Response) => {
  req.logout((err) => {
    res.status(200).json()
  })
})

router.get('/user', isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as User
  res.status(200).json({
    user,
    entries: await Entry.getEntries(user),
    categories: await Category.getCategories(user),
  })
})

router.post(
  '/edit-preferences',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { display_name, display_currency, start_amount }: UserPreferences =
      req.body

    const user = req.user as User

    const preferences = await User.updatePreferences(
      {
        display_name,
        display_currency,
        start_amount,
      },
      user
    )

    if (!preferences) {
      return res.status(400).json()
    }
    return res.status(200).json({ preferences })
  }
)

router.delete(
  '/delete-user',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = req.user as User

    if ((await User.validatePassword(user, password)) && user.email === email) {
      await User.deleteUser(user.id)
    }
    return res.status(200).json()
  }
)

export default router
