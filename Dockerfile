# Use Node.js LTS (Long Term Support)
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the API port (Assuming 3000 based on standard NestJS)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
