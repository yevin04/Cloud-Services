# Product Service Dockerfile
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
EXPOSE 4002

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4002
ENV MONGO_URI=mongodb+srv://yevinraja_db_user:isLxjtKxrCEEMZ30@yevinscluster.vqefddf.mongodb.net/?appName=YevinsCluster/cloudRetailProducts

# Start the application
CMD ["node", "src/server.js"]
