# Usar versão LTS do Node
FROM node:18-slim

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Fazer o build do frontend (Vite)
RUN npm run build

# Expor a porta que o servidor usa
EXPOSE 3001

# Comando para iniciar o servidor
CMD ["npm", "start"]
