# Use a small Node base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install deps first (better layer caching)
COPY package*.json ./

RUN npm install --omit=dev

# Copy source code
COPY src ./src

# Expose port (for local/dev)
EXPOSE 3000

# Default command
CMD ["npm", "start"]
