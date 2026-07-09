FROM oven/bun:1 AS builder

WORKDIR /app

COPY . .

RUN bun install

WORKDIR /app/apps/frontend

RUN bun run build

# Runtime stage
FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]