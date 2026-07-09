FROM oven/bun:1

WORKDIR /app

# Copy the entire workspace
COPY . .

# Install workspace dependencies
RUN bun install

# Move to backend
WORKDIR /app/apps/backend

# Generate Prisma Client
RUN bunx prisma generate

EXPOSE 3001

CMD ["bun", "index.ts"]