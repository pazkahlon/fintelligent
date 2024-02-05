import dotenv from 'dotenv'
dotenv.config()
console.log(process.env.APP_URL)

import express from 'express'

import session from 'express-session'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import cors from 'cors'
import * as User from './models/user'
import { createClient } from 'redis'
import RedisStore from 'connect-redis'

import auth from './routes/auth'
import entries from './routes/entries'
import categories from './routes/categories'

const app = express()

// Configure redis client & Exporting for test
export const redisClient = createClient(
  process.env.REDIS_URL
    ? {
        url: process.env.REDIS_URL,
      }
    : {
        socket: {
          port: 6379,
          host: process.env.DOCKER ? 'redis' : undefined,
        },
      }
)
redisClient.connect().catch(console.error)

const redisStore = new RedisStore({
  client: redisClient,
})
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === 'production',
    cookie: {
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
)

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    function (email, password, done) {
      User.findByEmail(email).then(async (user) => {
        if (!user) {
          return done(null, false, { message: 'User does not exist' })
        }
        if (!(await User.validatePassword(user, password))) {
          return done(null, false, { message: 'Password is not valid.' })
        }
        return done(null, user)
      })
    }
  )
)
passport.serializeUser((user: User, done) => {
  done(null, user.id)
})

passport.deserializeUser((id: number, done) => {
  User.findById(id).then((user: User) => {
    if (!user) {
      return done(null, false)
    }
    return done(null, user)
  })
})

app.use(passport.initialize())
app.use(passport.session())
app.use(
  cors({
    origin: process.env.APP_URL || `http://localhost:5173`,
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true,
  })
)

app.use('/auth', auth)
app.use(entries)
app.use(categories)

app.get('/', (req, res) => {
  res.send('Hello World')
})

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}

export default app
