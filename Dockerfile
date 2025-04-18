FROM node:20-slim

WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm ci

# Copia el resto de los archivos del proyecto
COPY . .

# Configura las variables de entorno
ENV NODE_ENV=production

# Expone el puerto que utiliza la aplicación
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]