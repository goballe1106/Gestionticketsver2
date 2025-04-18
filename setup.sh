
#!/bin/bash

# Actualizar el sistema
echo "Actualizando el sistema..."
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Node.js y npm
echo "Instalando Node.js y npm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
echo "Instalando PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Clonar el repositorio
echo "Clonando el repositorio..."
git clone https://github.com/goballe1106/Gestionticketsver2.git
cd Gestionticketsver2

# Instalar dependencias del proyecto
echo "Instalando dependencias..."
npm install

# Configurar la base de datos
echo "Configurando la base de datos..."
sudo -u postgres psql -c "CREATE DATABASE ticket_system;"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ticket_system TO postgres;"

# Inicializar la base de datos
echo "Inicializando la base de datos..."
sudo -u postgres psql ticket_system < init-db/01-schema.sql
sudo -u postgres psql ticket_system < init-db/02-add-ticket-type-column.sql
sudo -u postgres psql ticket_system < init-db/02-create-admin.sql

# Crear archivo .env
echo "Configurando variables de entorno..."
cp .env.example .env
sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticket_system|g' .env

# Construir el proyecto
echo "Construyendo el proyecto..."
npm run build

echo "¡Instalación completada!"
echo "Para iniciar el servidor ejecuta: npm run dev"
