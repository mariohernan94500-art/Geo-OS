# Etapa 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias primero (cache layer)
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Etapa 2: Producción (imagen ligera)
FROM node:20-alpine AS production

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar el código compilado desde el builder
COPY --from=builder /app/dist ./dist

# Crear directorio para archivos temporales de audio
RUN mkdir -p temp_audio

# Variable de entorno para el path de la DB
ENV DB_PATH=/data/memory.db

# Crear directorio persistente para SQLite
RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "dist/index.js"]
