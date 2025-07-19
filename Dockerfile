# Base stage (shared dependencies)
FROM node:20-alpine as base

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Development build stage
FROM base as development

# Copy rest of the project
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the application in dev mode
CMD ["npm", "run", "start:dev"]