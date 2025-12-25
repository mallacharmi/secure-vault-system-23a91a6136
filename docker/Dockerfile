FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy rest of the project
COPY . .

# Default command: run entrypoint script
CMD ["sh", "./docker/entrypoint.sh"]
