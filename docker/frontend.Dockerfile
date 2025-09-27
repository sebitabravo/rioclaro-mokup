# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia package files
COPY package.json pnpm-lock.yaml ./

# Instala dependencias
RUN pnpm install --frozen-lockfile

# Copia código fuente
COPY . .

# Build de producción
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copia el build al servidor web
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración nginx para SPA
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expone puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
