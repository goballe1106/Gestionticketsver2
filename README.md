# Sistema de Tickets de Soporte Técnico con Integración de Microsoft Teams

Sistema de gestión de tickets de soporte técnico con integración de chat en tiempo real a través de Microsoft Teams usando React, Express y PostgreSQL.

## Características

- Sistema completo de autenticación y autorización con roles (Usuario, Agente, Administrador)
- Gestión de tickets con distintos estados y prioridades
- Integración con Microsoft Teams para comunicación en tiempo real
- Panel de administración con estadísticas y reportes
- Interfaz de usuario moderna con Tailwind CSS y Shadcn UI

## Requisitos

- Docker y Docker Compose instalados en su sistema
- Credenciales de Microsoft Teams (opcional, solo si se utiliza la integración)

## Instalación y Ejecución con Docker

1. Clone este repositorio:
   ```
   git clone <url-del-repositorio>
   cd <directorio-del-repositorio>
   ```

2. Cree un archivo `.env` basado en `.env.example`:
   ```
   cp .env.example .env
   ```
   Edite el archivo `.env` y configure las variables necesarias, especialmente:
   - `SESSION_SECRET`: Una cadena aleatoria para la seguridad de la sesión
   - Variables de Microsoft Teams (si se utiliza la integración)

3. Construya y ejecute los contenedores con Docker Compose:
   ```
   docker-compose up -d
   ```

4. La aplicación estará disponible en `http://localhost:5000`

## Credenciales por defecto

Una vez que la aplicación esté ejecutándose, puede iniciar sesión con las siguientes credenciales de administrador predeterminadas:

- **Usuario**: admin
- **Contraseña**: Admin123!

Por razones de seguridad, se recomienda cambiar esta contraseña después del primer inicio de sesión.

## Configuración de Microsoft Teams (opcional)

Si desea utilizar la integración con Microsoft Teams, necesitará registrar una aplicación en Azure Active Directory y configurar las siguientes variables de entorno:

- `MS_TEAMS_CLIENT_ID`: ID de cliente de la aplicación registrada
- `MS_TEAMS_CLIENT_SECRET`: Secreto de cliente de la aplicación registrada
- `MS_TEAMS_TENANT_ID`: ID del inquilino (tenant) de Azure

## Personalización

- **Tema**: Puede personalizar los colores y la apariencia de la aplicación modificando el archivo `theme.json`
- **Logotipos**: Reemplace los archivos de imagen en el directorio `client/src/assets`

## Desarrollo

Si desea ejecutar la aplicación en modo de desarrollo:

1. Instale las dependencias:
   ```
   npm install
   ```

2. Inicie el servidor de desarrollo:
   ```
   npm run dev
   ```

## Licencia

MIT