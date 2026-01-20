# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY inter-media-app/package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy application code
COPY inter-media-app/ ./

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
