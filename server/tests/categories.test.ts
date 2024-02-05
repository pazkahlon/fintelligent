import request from 'supertest'
import app, { redisClient } from '../index'
import { createUser, deleteUser } from '../models/user'
import db from '../config/db'

let createdUserId: number | false
const random = Math.round(Math.random() * 1000)
var cookie: any

beforeAll(async () => {
  const userData = {
    email: `newuser@example${random}.com`,
    password: 'test123',
    display_name: null,
    display_currency: null,
    start_amount: null,
  }

  const createdUser = await createUser(userData)

  createdUserId = createdUser ? createdUser.id : false

  const response = await request(app).post('/auth/login').send(userData)
  cookie = response.headers['set-cookie']
})

let createdCategoryId: number

describe('POST /create-category', () => {
  it('should create a new category', async () => {
    const response = await request(app)
      .post('/create-category')
      .set('Cookie', cookie)
      .send({
        name: 'New Category',
        color: 'blue',
        icon: 'heart',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('category')
    expect(response.body.category).toHaveProperty('id')

    expect(response.body.category.name).toBe('New Category')
    expect(response.body.category.color).toBe('blue')
    expect(response.body.category.icon).toBe('heart')

    createdCategoryId = response.body.category.id
  })

  it('should not create a new category', async () => {
    const response = await request(app)
      .post('/create-category')
      .set('Cookie', cookie)
      .send({
        name: NaN,
      })

    expect(response.statusCode).toBe(400)
  })
})

describe('POST /edit-category', () => {
  it('should edit category', async () => {
    const response = await request(app)
      .post('/edit-category')
      .set('Cookie', cookie)
      .send({
        id: createdCategoryId,
        name: 'Edited Category',
        color: 'red',
        icon: 'bolt',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('category')

    expect(response.body.category.id).toBe(createdCategoryId)
    expect(response.body.category.name).toBe('Edited Category')
    expect(response.body.category.color).toBe('red')
    expect(response.body.category.icon).toBe('bolt')
  })

  it('should not edit category', async () => {
    const response = await request(app)
      .post('/edit-category')
      .set('Cookie', cookie)
      .send({
        id: -1,
        name: 'Edited Category',
        color: 'red',
        icon: 'bolt',
      })

    expect(response.statusCode).toBe(400)
  })
})
describe('POST /delete-category', () => {
  it('should delete category', async () => {
    const response = await request(app)
      .post('/delete-category')
      .set('Cookie', cookie)
      .send({
        category_id: createdCategoryId,
      })

    expect(response.statusCode).toBe(200)

    const categoriesResponse = await request(app)
      .get('/get-categories')
      .set('Cookie', cookie)

    expect(categoriesResponse.statusCode).toBe(200)
    expect(categoriesResponse.body).toHaveProperty('categories')
    expect(categoriesResponse.body.categories).toHaveLength(0)
  })

  it('should not delete category', async () => {
    const response = await request(app)
      .post('/delete-category')
      .set('Cookie', cookie)
      .send({
        category_id: -1,
      })

    expect(response.statusCode).toBe(400)
  })
})

describe('Unauthorized acts', () => {
  beforeAll(async () => {
    await request(app).post('/auth/logout').set('Cookie', cookie)
  })

  it('should not get categories', async () => {
    const response = await request(app)
      .get('/get-categories')
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(401)
  })

  it('should not create category', async () => {
    const response = await request(app)
      .post('/create-category')
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(401)
  })

  it('should not edit category', async () => {
    const response = await request(app)
      .post('/edit-category')
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(401)
  })

  it('should not delete category', async () => {
    const response = await request(app)
      .post('/delete-category')
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(401)
  })
})

// Cleanup
afterAll(async () => {
  if (createdUserId) {
    await deleteUser(createdUserId)
  }
  await redisClient.quit()
  await db.end()
})
