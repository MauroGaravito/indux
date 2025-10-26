# syntax=docker/dockerfile:1

# 1️⃣ Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2️⃣ Serve stage (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: agrega compresión y cache básica
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
