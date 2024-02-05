# Use an official Node runtime as a parent image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Needed for bcrypt on Alpine
RUN apk --no-cache add --virtual .builds-deps build-base python3

# Copy package.json and package-lock.json (or yarn.lock) into the working directory
COPY ./server/package*.json .

# Install any needed packages
RUN npm install

# Needed for bcrypt on Alpine
RUN npm rebuild bcrypt --build-from-source
RUN apk del .builds-deps

# Copy the rest of your app's source code from your host to your image filesystem.
COPY ./server/ .

# Copy the types file from the parent directory
COPY ./types.d.ts .

# Make port 3000 available to the world outside this container
EXPOSE 3001

# Run migrations & the app when the container launches
CMD ["/bin/sh", "./docker-entrypoint.sh"]
