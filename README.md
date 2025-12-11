# VoidShop

Aplicacion completa de e-commerce desarrollada con React 19, Express.js y PostgreSQL.

> **Estructura**: Monorepo con frontend y backend en un solo repositorio.
> **Deploy**: Railway (backend) + Vercel (frontend) o Docker en cualquier servidor.

## Descripcion

VoidShop es una plataforma de comercio electronico moderna que permite a los usuarios navegar por un catalogo de productos, gestionar su carrito de compras, agregar productos a favoritos y realizar ordenes. Incluye un panel de administracion completo para la gestion de productos, ordenes y cupones de descuento.

**Estructura del Monorepo**:
```
voidshop/
├── backend/          # API REST con Express + PostgreSQL
├── frontend/         # SPA con React 19 + Vite
├── docker-compose.yml # Desarrollo local con Docker
└── .env.example      # Variables de entorno
```

## Caracteristicas Principales

### Para Clientes
- Catalogo de productos con filtros avanzados (categoria, precio, stock)
- Sistema de busqueda en tiempo real
- Carrito de compras sincronizado con el backend
- Lista de favoritos persistente
- Perfiles de usuario con direcciones multiples
- Metodos de pago seguros (encriptacion AES-256)
- Historial de ordenes
- Sistema de cupones de descuento
- Soporte multiidioma (Espanol/Ingles)
- Diseno completamente responsivo

### Para Administradores
- Panel de administracion intuitivo
- CRUD completo de productos
- Gestion de ordenes con actualizacion de estados
- Sistema de cupones de descuento
- Estadisticas basicas de ventas

### Tecnicas
- Autenticacion JWT segura
- Migraciones automaticas de base de datos
- API RESTful documentada con Swagger
- Sistema de sesiones con expiracion automatica
- Validacion de stock en tiempo real
- Manejo robusto de errores

## Tecnologias Utilizadas

### Frontend
- React 19.0.0
- React Router DOM 7.1.1
- Vite 7.2.4
- i18next 24.2.1 (internacionalizacion)
- CSS Modules

### Backend
- Node.js 18+
- Express 5.1.0
- PostgreSQL 8.16.3
- JWT (jsonwebtoken 9.0.2)
- bcryptjs 3.0.3 (hash de passwords)
- Swagger (documentacion API)

## Inicio Rapido

### Opcion 1: Docker (Recomendado para probar)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Editar .env y agregar secrets (ver abajo)

# 3. Levantar todo
docker-compose up -d

# 4. Acceder a:
# - Frontend: http://localhost
# - Backend: http://localhost:3000
# - Swagger: http://localhost:3000/api-docs
```

### Opcion 2: Instalacion Manual

Continuar con la seccion de instalacion mas abajo.

## Requisitos del Sistema

### Para instalacion manual:
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 12.0

### Para Docker:
- Docker Desktop
- Docker Compose (incluido en Docker Desktop)

## Instalacion Manual

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/voidshop.git
cd voidshop
```

### 2. Configurar PostgreSQL

Crear una base de datos nueva:

```sql
CREATE DATABASE voidshop;
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Editar `backend/.env`:

```env
# Puerto del servidor
PORT=3000

# Credenciales del administrador por defecto
ADMIN_EMAIL=admin@voidshop.com
ADMIN_PASSWORD=tu_password_seguro

# Secret para JWT (GENERAR UNO NUEVO)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=2h

# Clave de encriptacion (32 caracteres exactos)
ENCRYPTION_KEY=12345678901234567890123456789012

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=voidshop

# Auto-migrations
AUTO_MIGRATE=true

# Entorno
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

**IMPORTANTE**: Cambiar JWT_SECRET y ENCRYPTION_KEY antes de produccion.

Generar JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Editar `frontend/.env`:

```env
VITE_ENV=development
VITE_API_URL=http://localhost:3000/api
```

### 5. Iniciar la Aplicacion

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

El backend estara disponible en `http://localhost:3000`
Swagger UI en `http://localhost:3000/api-docs`

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

El frontend estara disponible en `http://localhost:5173` o `5174`

### 6. Acceso Inicial

**Administrador**:
- Email: admin@voidshop.com
- Password: (el configurado en ADMIN_PASSWORD)

**Crear Cliente**:
- Registrarse desde la interfaz de usuario

## Migraciones de Base de Datos

El sistema incluye migraciones automaticas que se ejecutan al iniciar el backend (si `AUTO_MIGRATE=true`).

Las migraciones crean:
- 9 tablas (users, products, addresses, payment_methods, orders, order_items, coupons, cart_items, favorites)
- Indices para optimizacion
- Triggers para actualizar timestamps
- Datos iniciales (admin, productos de ejemplo, cupones)

Para mas detalles, ver `backend/MIGRACIONES.md`

## Estructura del Proyecto

```
voidshop/
├── backend/
│   ├── database/
│   │   ├── db.js                    # Conexion PostgreSQL
│   │   ├── migrations.js            # Sistema de migraciones
│   │   └── schema.sql               # Schema SQL completo
│   ├── middlewares/
│   │   └── authMiddleware.js        # Middleware JWT
│   ├── authRoutes.js                # Rutas de autenticacion
│   ├── cartRoutes.js                # Rutas de carrito
│   ├── couponRoutes.js              # Rutas de cupones
│   ├── favoriteRoutes.js            # Rutas de favoritos
│   ├── orderRoutes.js               # Rutas de ordenes
│   ├── paymentRoutes.js             # Rutas de metodos de pago
│   ├── productRoutes.js             # Rutas de productos
│   ├── userRoutes.js                # Rutas de usuarios
│   ├── index.js                     # Entry point
│   ├── swagger.js                   # Configuracion Swagger
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Componentes reutilizables
│   │   ├── context/                 # Contextos de React
│   │   ├── i18n/                    # Configuracion de idiomas
│   │   ├── layout/                  # Layouts
│   │   ├── pages/                   # Paginas principales
│   │   ├── services/                # Servicios API
│   │   ├── App.jsx                  # Componente raiz
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   └── .env
│
└── README.md
```

## API Endpoints

### Documentacion Completa

Acceder a `http://localhost:3000/api-docs` para ver la documentacion interactiva completa de Swagger.

### Endpoints Principales

**Autenticacion**
- POST `/api/auth/register` - Registrar nuevo usuario
- POST `/api/auth/login` - Iniciar sesion

**Productos**
- GET `/api/products` - Listar productos
- POST `/api/products` - Crear producto (admin)
- PUT `/api/products/:id` - Actualizar producto (admin)
- DELETE `/api/products/:id` - Eliminar producto (admin)

**Carrito**
- GET `/api/cart` - Obtener carrito (autenticado)
- POST `/api/cart` - Agregar al carrito (autenticado)
- PUT `/api/cart/:productId` - Actualizar cantidad (autenticado)
- DELETE `/api/cart/:productId` - Eliminar del carrito (autenticado)
- DELETE `/api/cart` - Vaciar carrito (autenticado)

**Favoritos**
- GET `/api/favorites` - Obtener favoritos (autenticado)
- POST `/api/favorites` - Agregar a favoritos (autenticado)
- DELETE `/api/favorites/:productId` - Eliminar de favoritos (autenticado)
- POST `/api/favorites/toggle` - Alternar favorito (autenticado)

**Ordenes**
- GET `/api/orders/my` - Mis ordenes (autenticado)
- POST `/api/orders` - Crear orden (autenticado)
- GET `/api/orders` - Todas las ordenes (admin)
- PUT `/api/orders/:id/status` - Actualizar estado (admin)

**Cupones**
- GET `/api/coupons` - Listar cupones
- POST `/api/coupons/validate` - Validar cupon
- POST `/api/coupons` - Crear cupon (admin)
- DELETE `/api/coupons/:code` - Eliminar cupon (admin)

## Scripts Disponibles

### Backend

```bash
npm start       # Iniciar servidor en produccion
npm run dev     # Iniciar servidor en desarrollo (nodemon)
npm run build   # Verificar que esta listo para produccion
```

### Frontend

```bash
npm run dev     # Iniciar servidor de desarrollo
npm run build   # Crear build de produccion
npm run preview # Preview del build
npm run lint    # Ejecutar linter
```

## Despliegue en Produccion

### Backend

**Opciones Recomendadas**:
1. Render (incluye PostgreSQL gratuito)
2. Railway
3. Heroku
4. DigitalOcean App Platform

**Pasos**:
1. Crear base de datos PostgreSQL en la nube
2. Configurar variables de entorno en la plataforma
3. Asegurar que `AUTO_MIGRATE=true` para crear tablas automaticamente
4. Deploy del codigo

Ver `backend/MIGRACIONES.md` para guias detalladas de deployment.

### Frontend

**Opciones Recomendadas**:
1. Vercel (ideal para React)
2. Netlify
3. Cloudflare Pages

**Pasos**:
1. Build del proyecto: `npm run build`
2. Configurar `VITE_API_URL` con la URL del backend en produccion
3. Deploy de la carpeta `dist/`

Ver `frontend/DOCUMENTACION.md` para mas detalles.

## Seguridad

### Antes de Produccion

1. Generar JWT_SECRET seguro nuevo
2. Generar ENCRYPTION_KEY seguro nuevo (32 caracteres)
3. Cambiar ADMIN_PASSWORD
4. Configurar CORS con origenes especificos
5. Considerar instalar:
   - `helmet` (headers de seguridad)
   - `express-rate-limit` (proteccion contra brute force)
   - `compression` (compresion de respuestas)

Ver `AUDITORIA_PRODUCCION.md` para checklist completo.

## Documentacion Adicional

- `backend/README_BACKEND.md` - Documentacion detallada del backend
- `backend/MIGRACIONES.md` - Sistema de migraciones automaticas
- `frontend/DOCUMENTACION.md` - Documentacion completa del frontend
- `AUDITORIA_PRODUCCION.md` - Checklist de produccion

## Troubleshooting

### Backend no inicia

1. Verificar que PostgreSQL este corriendo
2. Verificar credenciales en `.env`
3. Verificar que la base de datos `voidshop` exista

### Migraciones fallan

1. Verificar que AUTO_MIGRATE=true
2. Ver logs en la consola
3. Ejecutar manualmente `backend/database/schema.sql` si es necesario

### Frontend no conecta con backend

1. Verificar que backend este corriendo en puerto 3000
2. Verificar VITE_API_URL en `.env`
3. Revisar configuracion de CORS en backend

### Sesion se cierra automaticamente

1. Es comportamiento normal si el backend se reinicia
2. Verificar JWT_SECRET sea el mismo entre reinicios
3. Ajustar JWT_EXPIRES_IN si necesario

## Contribuir

1. Fork del proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto es privado.

## Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.

---

**Version**: 1.0.0
**Fecha**: Diciembre 2025
**Autor:** Luis Rodríguez