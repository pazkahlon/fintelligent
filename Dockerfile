# Step 1: Build the Vue application
# Use an official Node runtime as the base image for the build stage
FROM node:lts-alpine as build-stage

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# Build the app
RUN npm run build

# Step 2: Serve the app using a lightweight server like nginx
# Use an official nginx image as the base for the production stage
FROM nginx:stable-alpine as production-stage

# Copy the default.conf file for SPA
COPY default.conf /etc/nginx/conf.d

# Copy the build output to replace the default nginx contents
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 to the Docker host, so we can access our app
EXPOSE 80

# Start nginx and keep it running
CMD ["nginx", "-g", "daemon off;"]