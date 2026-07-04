# Stage 1: Build the React application
FROM oven/bun:1.1-slim AS builder

WORKDIR /app

# Copy package configurations
COPY package.json ./

# Install development & production dependencies
RUN bun install

# Copy source and style assets
COPY src/ ./src/
COPY styles/ ./styles/
COPY tsconfig.json components.json build.ts ./

# Compile production bundle using build script
RUN bun run build

# Stage 2: Serve the compiled static assets using Nginx
FROM nginx:alpine

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
