# syntax=docker/dockerfile:1

# === 1️⃣ Build stage ===
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# ⚠️ Importante: pasar el argumento VITE_API_URL en tiempo de build
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Generar el build de producción
RUN npm run build

# === 2️⃣ Runtime stage (Nginx) ===
FROM nginx:alpine

# Copiar archivos estáticos generados
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html

# Configuración básica de Nginx para SPAs
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
