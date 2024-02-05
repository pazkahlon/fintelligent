import { NextFunction, Request, Response, Router } from 'express'
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

router.post(
  '/create-category',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { name, color, icon }: Category = req.body

    if (
      typeof name !== 'string' ||
      typeof color !== 'string' ||
      (typeof icon !== 'string' && icon !== null)
    ) {
      return res.status(400).json()
    }

    const category = await Category.createCategory(
      { name, color, icon },
      req.user as User
    )

    if (!category) {
      return res.status(400).json()
    }
    return res.status(200).json({ category })
  }
)

router.post(
  '/edit-category',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id, name, color, icon }: Category = req.body

    if (
      typeof name !== 'string' ||
      typeof color !== 'string' ||
      (typeof icon !== 'string' && icon !== null)
    ) {
      return res.status(400).json()
    }

    const category = await Category.updateCategory(
      { id, name, color, icon },
      req.user as User
    )

    if (!category) {
      return res.status(400).json()
    }
    return res.status(200).json({ category })
  }
)

router.post(
  '/delete-category',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { category_id } = req.body

    if (typeof category_id !== 'number') {
      return res.status(400).json()
    }

    const deleteCaegory = await Category.deleteCategory(
      category_id,
      req.user as User
    )

    if (!deleteCaegory) {
      return res.status(400).json()
    }
    return res.status(200).json({ deleteCaegory })
  }
)

router.get(
  '/get-categories',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const categories = await Category.getCategories(req.user as User)

    if (!categories) {
      return res.status(400).json()
    }
    return res.status(200).json({ categories })
  }
)

export default router
