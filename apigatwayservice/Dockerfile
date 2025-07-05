# Base image for the Node.js application.
FROM node:20-alpine

# WORKDIR is the directory where the command will be run and where the files will be copied to.
WORKDIR /usr/src/api-gateway-service

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install only production dependencies
# This will ensure that only the dependencies needed for production are installed, excluding devDependencies.
RUN npm ci --only=production

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the application will run on
EXPOSE 3000

CMD ["npm" , "start"]
