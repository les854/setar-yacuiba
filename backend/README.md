# Sistema de Geolocalización de Medidores - SETAR Yacuiba

Backend REST en JavaScript (Node.js + Express) para el sistema de geolocalización de medidores de agua/gas de la empresa SETAR Yacuiba, con base de datos PostgreSQL y PostGIS.

## Requisitos

- Node.js 18+
- PostgreSQL 18+
- PostGIS 3.x

## Instalación

```bash
## Clonar el repositorio
git clone https://github.com/les854/geolocalizacion-medidores-setar-yacuiba.git

## Entrar al backend
cd backend

## Instalar dependencias
npm install

## Crear archivo .env con las variables de entorno
## Ver sección de Variables de Entorno

## Iniciar el servidor
npm run dev

## Modo desarrollo con recarga automática:
npm run dev

## Documentación OpenAPI

Swagger UI: http://localhost:4000/api/docs
Spec YAML: http://localhost:4000/api/docs/openapi.yaml

## Usuario demo

| Campo      | Valor              |
|------------|--------------------|
| Email      | demo@setar.yba     |
| Contraseña | admin1234          |

## Endpoints

### Autenticación (`/api/auth`)

| Método | Ruta                | Descripción              |
|--------|---------------------|--------------------------|
| POST   | `/register`         | Registrar usuario        |
| POST   | `/login`            | Iniciar sesión           |

## Usuarios (`/api/usuarios`)

| Método | Ruta                | Descripción                        |
|--------|---------------------|------------------------------------|
| GET    | `/`                 | Listar usuarios                    |
| POST   | `/`                 | Crear usuario                      |
| GET    | `/:id`              | Obtener usuario                    |
| PUT    | `/:id`              | Actualizar usuario                 |
| DELETE | `/:id`              | Eliminar usuario                   |


###  Técnicos(`/api/tecnicos`)

| Método | Ruta                | Descripción              |
|--------|---------------------|--------------------------|
| GET    | `/`                 | Listar técnicos          |
| POST   | `/`                 | Crear técnico            |
| GET    | `/:id`              | Obtener técnico          |
| PUT    | `/:id`              | Actualizar técnico       |
| DELETE | `/:id`              | Eliminar técnico         |

###  Clientes (/api/clientes)

| Método | Ruta                | Descripción              |
|--------|---------------------|--------------------------|
| GET    | `/`                 | Listar clientes          |
| POST   | `/`                 | Crear cliente            |
| GET    | `/:id`              | Obtener cliente          |
| PUT    | `/:id`              | Actualizar cliente       |
| DELETE | `/:id`              | Eliminar cliente         |

###  Medidores (/api/medidores)

| Método | Ruta                | Descripción              |
|--------|---------------------|--------------------------|
| GET    | `/`                 | Listar medidores         |
| POST   | `/`                 | Crear medidor (con GPS)  |
| GET    | `/:id`              | Obtener medidor          |
| PUT    | `/:id`              | Actualizar medidor       |
| DELETE | `/:id`              | Eliminar medidor         |


### Health

| Método | Ruta           | Descripción    |
|--------|----------------|----------------|
| GET    | `/api/health`  | Health check   |

## Autenticación

Tras el login, incluir el token JWT en cada petición:

```
Authorization: Bearer <token>
```

## Ejemplo rápido

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@setar.yba","password":"admin123"}'

# Listar medidores
curl http://localhost:4000/api/medidores \
  -H "Authorization: Bearer <TOKEN>"

# Crear medidor
curl -X POST http://localhost:4000/api/medidores \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "numero_serie": "MED-LUZ-001",
    "tipo": "Luz",
    "marca": "BrandX",
    "modelo": "Model-2024",
    "cliente_id": 1,
    "latitud": -22.456789,
    "longitud": -63.123456
  }'
```

## Estructura del proyecto

```
src/
── app.js              # Configuración Express + Swagger
├── server.js           # Punto de entrada
── controllers/        # Controladores HTTP
├── services/           # Lógica de negocio
├── routes/             # Rutas REST
├── middleware/         # Auth, errores
├── validators/         # Validación de entrada
├── db/                 # PostgreSQL + PostGIS + seed
└── openapi.yaml        # Especificación OpenAPI 3.0
```

## Variables de entorno

| Variable     | Default                         | Descripción         |
|--------------|---------------------------------|-------------------- |
| PORT         | 4000                            | Puerto del servidor |
| DB_HOST      | 	localhost                    | Host de la base de datos |
| DB_PORT      | 	5432                         | Puerto de PostgreSQL|
| DB_USER      | 	postgres                     | Usuario de la base de datos|
| DB_PASSWORD      | 	(requerido)              | Contraseña de la BD|
| DB_NAME      | 	sistema_medidores            | Nombres de la base de datos|
| JWT_SECRET      | 	(requerido)              | Secreto para firmar JWT|

 