# Backend Dockerfile
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo dev para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build && ls -la dist/

# Expor porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"]
