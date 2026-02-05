# Inventory Service Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 4003

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4003
ENV AWS_REGION=ap-south-1
ENV DDB_INVENTORY_TABLE=Inventory

# Start the application
CMD ["node", "src/server.js"]
