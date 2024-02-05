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

let createdEntryId: number

describe('POST /create-entry', () => {
  it('should create a new entry', async () => {
    const response = await request(app)
      .post('/create-entry')
      .set('Cookie', cookie)
      .send({
        name: 'New Entry',
        is_income: true,
        category_id: null,
        amount: 100,
        occurs_on: new Date().getTime(),
        reccuring: false,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('entry')
    expect(response.body.entry).toHaveProperty('id')

    expect(response.body.entry.name).toBe('New Entry')
    expect(response.body.entry.is_income).toBe(true)
    expect(response.body.entry.category_id).toBeNull()
    expect(response.body.entry.amount).toBe(100)
    expect(response.body.entry.reccuring).toBe(false)

    createdEntryId = response.body.entry.id
  })

  it('should not create a new entry', async () => {
    const response = await request(app)
      .post('/create-entry')
      .set('Cookie', cookie)
      .send({
        name: NaN,
        is_income: true,
        amount: 1000,
      })

    expect(response.statusCode).toBe(400)
  })
})

describe('POST /edit-entry', () => {
  it('should edit entry', async () => {
    const response = await request(app)
      .post('/edit-entry')
      .set('Cookie', cookie)
      .send({
        id: createdEntryId,
        name: 'Edited Entry',
        is_income: false,
        category_id: null,
        amount: 100,
        occurs_on: new Date().getTime(),
        reccuring: false,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('entry')

    expect(response.body.entry.id).toBe(createdEntryId)
    expect(response.body.entry.name).toBe('Edited Entry')
    expect(response.body.entry.is_income).toBe(false)
    expect(response.body.entry.category_id).toBeNull()
    expect(response.body.entry.amount).toBe(100)
    expect(response.body.entry.reccuring).toBe(false)
  })

  it('should not edit entry', async () => {
    const response = await request(app)
      .post('/edit-entry')
      .set('Cookie', cookie)
      .send({
        id: -1,
        name: 'Edited Entry',
        is_income: false,
        category_id: null,
        amount: 100,
        occurs_on: new Date().getTime(),
        reccuring: false,
      })

    expect(response.statusCode).toBe(400)
  })
})
describe('POST /delete-entry', () => {
  it('should delete entry', async () => {
    const response = await request(app)
      .post('/delete-entry')
      .set('Cookie', cookie)
      .send({
        entry_id: createdEntryId,
      })

    expect(response.statusCode).toBe(200)

    const entriesResponse = await request(app)
      .get('/get-entries')
      .set('Cookie', cookie)

    expect(entriesResponse.statusCode).toBe(200)
    expect(entriesResponse.body).toHaveProperty('entries')
    expect(entriesResponse.body.entries).toHaveLength(0)
  })

  it('should not delete entry', async () => {
    const response = await request(app)
      .post('/delete-entry')
      .set('Cookie', cookie)
      .send({
        entry_id: -1,
      })

    expect(response.statusCode).toBe(400)
  })
})

describe('Unauthorized acts', () => {
  beforeAll(async () => {
    await request(app).post('/auth/logout').set('Cookie', cookie)
  })

  it('should not get entries', async () => {
    const response = await request(app)
      .get('/get-entries')
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(401)
  })

  it('should not create entry', async () => {
    const response = await request(app)
      .post('/create-entry')
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(401)
  })

  it('should not edit entry', async () => {
    const response = await request(app)
      .post('/edit-entry')
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(401)
  })

  it('should not delete entry', async () => {
    const response = await request(app)
      .post('/delete-entry')
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
