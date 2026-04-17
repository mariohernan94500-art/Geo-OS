FROM node:20-slim

# Directorio de trabajo del monorepo
WORKDIR /app

# Instalar PM2 para gestión de procesos 24/7
RUN npm install pm2 -g

# Copiar configuración de dependencias de todo el monorepo
COPY package*.json ./
COPY packages/geotrouvetout/package*.json ./packages/geotrouvetout/
COPY packages/ecoorigen-web/package*.json ./packages/ecoorigen-web/

# Instalar dependencias
RUN npm install

# Copiar el grueso de los proyectos (excluyendo lo del .dockerignore)
COPY . .

# Construir Geotrouvetout (TS -> JS)
WORKDIR /app/packages/geotrouvetout
RUN npm run build

# Regreso a la raíz para lanzamiento
WORKDIR /app

# Puertos: API (3000) y Voren (8080)
EXPOSE 3000 8080

# Lanzar el sistema consolidado con PM2
CMD ["pm2-runtime", "docker/pm2.config.js"]
