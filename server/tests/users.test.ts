import request from 'supertest'
import app, { redisClient } from '../index'
import { deleteUser } from '../models/user'
import db from '../config/db'

let createdUserId: number
const random = Math.round(Math.random() * 1000)
var cookie: any

describe('POST /auth/register', () => {
  it('should register a new user', async () => {
    const userData = {
      email: `newuser@example${random}.com`,
      password: 'test123',
    }

    const response = await request(app).post('/auth/register').send(userData)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('id')

    // Store the created user id for cleanup
    createdUserId = response.body.id
  })

  it('should fail if email is invalid', async () => {
    const userData = {
      email: NaN,
      password: 'test123',
    }

    const response = await request(app).post('/auth/register').send(userData)

    expect(response.statusCode).toBe(400)
  })

  it('should fail if the username already exists', async () => {
    const userData = {
      email: `newuser@example${random}.com`,
      password: '123456',
    }

    const response = await request(app).post('/auth/register').send(userData)

    expect(response.statusCode).toBe(400)
  })
})

describe('POST /auth/login', () => {
  it('should not login user', async () => {
    const userData = {
      email: `newuser@example${random}.com`,
      password: NaN,
    }

    const response = await request(app).post('/auth/login').send(userData)

    expect(response.statusCode).toBe(400)
  })

  it('should login user', async () => {
    const userData = {
      email: `newuser@example${random}.com`,
      password: 'test123',
    }

    const response = await request(app).post('/auth/login').send(userData)

    expect(response.statusCode).toBe(200)
    cookie = response.headers['set-cookie']
  })
})

describe('POST /auth/user', () => {
  it('should get user', async () => {
    const response = await request(app).get('/auth/user').set('Cookie', cookie)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('entries')
    expect(response.body).toHaveProperty('categories')
  })
})

describe('POST /auth/edit-preferences', () => {
  it("should update & return user's preferences", async () => {
    const response = await request(app)
      .post('/auth/edit-preferences')
      .set('Cookie', cookie)
      .send({
        display_name: 'New Name',
        display_currency: 'ILS',
        start_amount: 10,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('preferences')
    expect(response.body.preferences.display_name).toBe('New Name')
    expect(response.body.preferences.display_currency).toBe('ILS')
    expect(response.body.preferences.start_amount).toBe(10)
  })
  it("should not update user's preferences", async () => {
    const response = await request(app)
      .post('/auth/edit-preferences')
      .set('Cookie', cookie)
      .send({
        display_name: null,
        start_amount: 10,
      })

    expect(response.statusCode).toBe(400)
  })
})

describe('POST /auth/logout', () => {
  it('should logout user', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(200)
  })
})

describe('Unauthorized acts', () => {
  it('should not get user', async () => {
    const response = await request(app).get('/auth/user').set('Cookie', cookie)

    expect(response.statusCode).toBe(401)
  })

  it('should not edit preferences', async () => {
    const response = await request(app)
      .post('/auth/edit-preferences')
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
