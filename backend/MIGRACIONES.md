# Sistema de Migraciones Automáticas - VoidShop

## Características

El backend de VoidShop incluye un sistema de **migraciones automáticas** que:

- Crea todas las tablas necesarias automáticamente
- Verifica si las tablas ya existen (no duplica nada)
- Crea índices para mejorar el rendimiento
- Configura triggers para campos `updated_at`
- Inserta datos iniciales (seed) si la base de datos está vacía
- Funciona tanto en desarrollo como en producción

## Configuración

### 1. Variables de Entorno

Configura tu archivo `.env`:

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=voidshop

# Activar/desactivar migraciones automáticas
AUTO_MIGRATE=true
```

### 2. Opciones de AUTO_MIGRATE

- `AUTO_MIGRATE=true` → Las migraciones se ejecutan automáticamente al iniciar el servidor
- `AUTO_MIGRATE=false` → Las migraciones NO se ejecutan (útil en producción si prefieres control manual)

## ¿Qué hace el sistema de migraciones?

Cuando inicias el backend con `npm run dev` o `npm start`:

```bash
Ejecutando migraciones de base de datos...
  Tabla 'users' creada
  Tabla 'products' creada
  Tabla 'addresses' creada
  Tabla 'payment_methods' creada
  Tabla 'orders' creada
  Tabla 'order_items' creada
  Tabla 'coupons' creada
  Tabla 'cart_items' creada
  Tabla 'favorites' creada
  Función 'update_updated_at_column' creada
  Trigger 'update_products_updated_at' creado
  Trigger 'update_orders_updated_at' creado
  Trigger 'update_cart_items_updated_at' creado
  Índice 'idx_users_email' creado
  ... (todos los índices)
  Insertando datos iniciales...
  Datos iniciales insertados
Migraciones completadas exitosamente
```

Si las tablas ya existen:

```bash
Ejecutando migraciones de base de datos...
  Tabla 'users' ya existe
  Tabla 'products' ya existe
  ... (salta las que ya existen)
Migraciones completadas exitosamente
```

## Tablas Creadas

El sistema crea automáticamente:

### Tablas principales
1. **users** - Usuarios del sistema
2. **products** - Catálogo de productos
3. **orders** - Órdenes de compra
4. **order_items** - Items de cada orden
5. **coupons** - Cupones de descuento

### Tablas de perfil de usuario
6. **addresses** - Direcciones de envío
7. **payment_methods** - Métodos de pago (encriptados)

### Tablas nuevas (persistencia en backend)
8. **cart_items** - Carrito de compras
9. **favorites** - Productos favoritos

## Datos Iniciales (Seed)

Si la base de datos está vacía, se insertan automáticamente:

- **1 usuario admin** - Email: `admin@voidshop.com`, Password: `admin123`
- **10 productos** - Diferentes categorías (Mujer, Hombre, Electrónicos, etc.)
- **3 cupones** - Códigos: `BIENVENIDO10`, `VERANO50`, `NAVIDAD2024`

## Uso en Diferentes Entornos

### Desarrollo Local

```bash
# 1. Clonar el proyecto
git clone <tu-repo>
cd VoidShop/backend

# 2. Instalar dependencias
npm install

# 3. Configurar .env
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 4. Iniciar el servidor (las migraciones se ejecutan automáticamente)
npm run dev
```

**¡Eso es todo!** No necesitas ejecutar scripts SQL manualmente.

### Producción (Render, Railway, Heroku, etc.)

#### Opción 1: Migraciones Automáticas (Recomendado)

```env
AUTO_MIGRATE=true
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

El servidor ejecutará las migraciones en el primer despliegue.

#### Opción 2: Control Manual

```env
AUTO_MIGRATE=false
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

Ejecuta las migraciones manualmente desde el schema.sql o con un script personalizado.

## Comandos Útiles

### Verificar tablas creadas

```bash
# Desde psql
psql -U postgres -d voidshop -c "\dt"

# Desde código
# El sistema ya verifica automáticamente
```

### Resetear la base de datos

```bash
# Opción 1: Desde pgAdmin
# Eliminar todas las tablas y volver a ejecutar npm run dev

# Opción 2: Desde psql
psql -U postgres -d voidshop -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Luego reiniciar el backend
npm run dev
```

### Ver logs de migraciones

Los logs aparecen automáticamente en la consola cuando inicias el servidor.

## Arquitectura del Sistema

```
backend/
├── database/
│   ├── db.js              # Conexión a PostgreSQL
│   ├── migrations.js      # Sistema de migraciones
│   ├── schema.sql         # SQL completo (referencia)
│   └── migration_cart_favorites.sql  # Migración específica
├── index.js               # Ejecuta migraciones al iniciar
└── .env                   # Configuración (AUTO_MIGRATE)
```

### Flujo de ejecución

1. **Backend inicia** → Lee `AUTO_MIGRATE` del `.env`
2. **Si AUTO_MIGRATE=true** → Ejecuta `runMigrations()`
3. **Para cada tabla** → Verifica si existe con `tableExists()`
4. **Si no existe** → La crea con `CREATE TABLE`
5. **Si existe** → Salta (`Tabla ya existe`)
6. **Crea índices** → Mejora rendimiento
7. **Crea triggers** → Actualiza `updated_at` automáticamente
8. **Verifica datos** → Si está vacío, inserta seed data
9. **Servidor listo** → API lista para recibir requests

## Troubleshooting

### Error: "database does not exist"

```bash
# Crear la base de datos manualmente
psql -U postgres -c "CREATE DATABASE voidshop;"

# Luego reiniciar el backend
npm run dev
```

### Error: "permission denied"

Verifica que tu usuario de PostgreSQL tenga permisos:

```sql
GRANT ALL PRIVILEGES ON DATABASE voidshop TO postgres;
```

### Las migraciones no se ejecutan

Verifica que `AUTO_MIGRATE=true` en tu `.env`:

```env
AUTO_MIGRATE=true  # Correcto
# AUTO_MIGRATE=false  # Desactivado
```

### Error: "already exists"

Esto es normal y seguro. El sistema detecta lo que ya existe y lo salta.

### DO
- Mantén `AUTO_MIGRATE=true` en desarrollo
- Usa `AUTO_MIGRATE=true` en producción para el primer deploy
- Revisa los logs de migraciones para verificar que todo esté bien
- Haz backup antes de cambios grandes en producción

### DON'T
- No edites las tablas manualmente si usas auto-migraciones
- No ejecutes scripts SQL antiguos sobre la BD migrada
- No olvides hacer backup en producción
- No cambies `AUTO_MIGRATE` sin entender las consecuencias

## Deploy a Producción

### Render.com

```yaml
# render.yaml
services:
  - type: web
    name: voidshop-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: AUTO_MIGRATE
        value: true
      - key: DATABASE_URL
        fromDatabase:
          name: voidshop-db
          property: connectionString
```

### Railway.app

```bash
# Railway detecta automáticamente
# Solo configura las variables de entorno en el dashboard
AUTO_MIGRATE=true
DATABASE_URL=<provided by Railway>
```