# FILE: frontend/Dockerfile

# 1. Construir a aplicação SvelteKit
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Usar Nginx para servir os ficheiros estáticos
FROM nginx:1.25-alpine AS production

# Copia os ficheiros estáticos construídos para o diretório do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copia o ficheiro de fallback do SvelteKit para o Nginx para lidar com rotas de Single Page Application
# CORREÇÃO: O caminho para o 200.html é na raiz da pasta 'build', não em '_app'
COPY --from=build /app/build/200.html /usr/share/nginx/html/index.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

