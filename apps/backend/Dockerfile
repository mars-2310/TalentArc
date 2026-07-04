# Use the official Bun image as base
FROM oven/bun:latest

WORKDIR /app

# Copy package configuration
COPY package.json ./

# Install backend dependencies
RUN bun install --production

# Copy database schema definition
COPY prisma ./prisma/

# Generate database client code
RUN bun x prisma generate --schema=./prisma/schema.prisma

# Copy application source files
COPY . .

# Expose application listening port
EXPOSE 3001

# Run the backend application
CMD ["bun", "run", "index.ts"]
