# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar codigo fuente
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar node_modules y codigo desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Exponer puerto (Railway lo asignará dinámicamente)
EXPOSE 3000

# Variable de entorno por defecto
ENV NODE_ENV=production

# Health check deshabilitado para Railway
# Railway maneja health checks externamente

# Comando de inicio
CMD ["npm", "start"]
