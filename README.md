![Peers](src/assets/banner.png)

# fintelligent

A platform to demonstrate your incomes and outcomes, and give you a 12 month forecast.
Front-End built on top of Vue 3 in Vite, Back-End on top of Express.js & PostgreSQL.

[Live Demo](https://fintelligent.onrender.com/)

## Front End Setup

```sh
npm install
```

### Env Setup

You'll need to pass through an environment variable `VITE_API_URL` for the API entrypoint.
This can be done via .env or by passing it directly to the run commands.
Example:

```bash
VITE_API_URL = http://localhost:3001
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

## Back End Setup

The API back-end is located at `/server`

### Requirements

For the backend, in addition to node, you'll need

- PostgreSQL
- Redis server

### Env Setup

Before initiating the back-end, you'll need to create another "`.env`" file at `/server`.
An example for an .env file would be:

```bash
# POSTGRES
DATABASE_URL = postgres://postgres@localhost:5432/fintelligence # Overriden when using Docker
# SESSION
SESSION_SECRET = YOUR_SESSION_SECRET
# API
PORT = 3001
#APP
APP_URL = http://localhost:5173
# OPTIONAL: REDIS
REDIS_URL = redis://...
```

`DATABASE_URL` - the URL for your postgres database.
`SESSION_SECRET` - being used in express-session, can be any sequence.
`PORT` - the port for your server. (using `3001` by default)
`APP_URL` - the full url of your front-end, to enable CORS between API & front-end. (using `http://localhost:5173` by default)
`REDIS_URL` - optional, you may enter a custom redis url.

After setting the `.env` values you can continue with the setup:

```sh
cd server
npm install
npm run migrate:up
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile without Hot-Reload for Production

```sh
npm run build
```

### Run Unit Tests with [Jest](https://jestjs.io/)

```sh
npm run test
```

## Docker Setup

This app supports docker, and runs both the front-end & the back-end along with redis & postgres.
First, you'll need to initiate both `.env` files as stated above.

Then, you'll need to modify the **root `/.env`** file with the following additions:

```bash
# POSTGRES
POSTGRES_PORT = 5432 # Used for exposing the postgres server locally.
POSTGRES_USER = postgres
POSTGRES_PASSWORD = 123456
POSTGRES_DB = fintelligence

DOCKER_APP_PORT = 8080 # Exposing front-end
DOCKER_API_PORT = 3001 # Exposing back-end
```

`POSTGRES_*` would be the credentials for your postgres server.

The docker app will use the nginx configurations in `/default.conf`.

You can create & run the docker application by running

```sh
docker compose up --build
```

Where 4 services would be created: redis, postgres, server & vueapp, all under fintelligent.
Also, a volume would be created for the database.

You can now access the app through the port `DOCKER_APP_PORT`, and access your database through the defined credentials.
