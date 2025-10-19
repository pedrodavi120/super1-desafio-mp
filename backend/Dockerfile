# FILE: backend/Dockerfile

# 1. Usar uma imagem base oficial e robusta do Node.js (baseada em Debian)
FROM node:18

# Instalar o Bun globalmente dentro deste ambiente
RUN npm install -g bun

# Instalar dependências de sistema: openssl (para Prisma) e curl (para o script de espera)
RUN apt-get update && apt-get install -y --no-install-recommends openssl curl

# 2. Definir o diretório de trabalho
WORKDIR /app

# 3. Instalar dependências
COPY package.json ./
COPY prisma ./prisma
RUN bun install

# 4. Copiar o resto do código da aplicação
COPY . .

# 5. Expor a porta
EXPOSE 3000

# 6. Comando para iniciar a aplicação (será sobrescrito pelo docker-compose.yml para adicionar a lógica de espera)
CMD ["bun", "run", "dev"]

