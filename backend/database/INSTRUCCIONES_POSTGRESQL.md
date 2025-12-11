# GUÍA COMPLETA: Instalación y Configuración de PostgreSQL para VoidShop

## Paso 1: Instalar PostgreSQL en Windows

### Descarga e Instalación

1. **Descargar PostgreSQL**:
   - Ve a: https://www.postgresql.org/download/windows/
   - Haz clic en "Download the installer"
   - Descarga **PostgreSQL 18** para Windows x86-64

2. **Ejecutar el Instalador**:
   - Ejecuta el archivo `.exe` descargado
   - Acepta los términos y condiciones

3. **Configuración durante la instalación**:
   - **Installation Directory**: Deja por defecto (`C:\Program Files\PostgreSQL\16`)
   - **Select Components**: Marca TODOS:
     - PostgreSQL Server
     - pgAdmin 4 (interfaz gráfica)
     - Stack Builder (opcional)
     - Command Line Tools
   - **Data Directory**: Deja por defecto (`C:\Program Files\PostgreSQL\16\data`)
   - **Password**: 
     - **MUY IMPORTANTE**: Crea una contraseña segura para el usuario `postgres`
     - **APUNTA ESTA CONTRASEÑA** (la necesitarás todo el tiempo)
     - Ejemplo: `admin` (para desarrollo local)
   - **Port**: Deja **5432** (puerto por defecto)
   - **Advanced Options - Locale**: Deja "Default locale"
   - Haz clic en "Next" → "Next" → "Finish"

4. **Verificar instalación**:
   - Abre PowerShell (Win + X → PowerShell)
   - Ejecuta:
     ```powershell
     psql --version
     ```
   - Deberías ver: `psql (PostgreSQL) 16.x`

---

## Paso 2: Crear la Base de Datos

1. **Abrir pgAdmin 4**:
   - Busca "pgAdmin 4" en el menú inicio de Windows
   - Se abrirá en tu navegador
   - Te pedirá crear una "Master Password" (puede ser la misma que usaste antes)

2. **Conectarse al servidor**:
   - En el panel izquierdo, haz clic en "Servers"
   - Haz clic en "PostgreSQL 16"
   - Te pedirá la contraseña del usuario `postgres` (la que creaste en la instalación)

3. **Crear la base de datos**:
   - Clic derecho en "Databases" → "Create" → "Database..."
   - En "Database": Escribe `voidshop`
   - En "Owner": Deja `postgres`
   - Haz clic en "Save"

4. **Ejecutar el schema.sql**:
   - Expande "Databases" → "voidshop"
   - Clic derecho en "voidshop" → "Query Tool"
   - Abre el archivo `backend/database/schema.sql` con un editor de texto
   - **COPIA TODO EL CONTENIDO** (Ctrl+A, Ctrl+C)
   - **PEGA** en el Query Tool de pgAdmin (Ctrl+V)
   - Haz clic en el botón "▶ Execute/Refresh" (F5)
   - Deberías ver: "Query returned successfully"

5. **Verificar las tablas**:
   - En el panel izquierdo, expande: "voidshop" → "Schemas" → "public" → "Tables"
   - Deberías ver: `users`, `products`, `addresses`, `payment_methods`, `orders`, `order_items`, `coupons`

## Paso 3: Configurar Node.js para PostgreSQL

### Instalar la librería `pg`

1. **Abrir PowerShell** en la carpeta del backend:
   ```powershell
   cd C:\Users\luisp\OneDrive\Desktop\VoidShop\backend
   npm install pg dotenv
   ```

2. **Verificar instalación**:
   - Abre `backend/package.json`
   - Deberías ver `pg` en las dependencias

---

## Paso 4: Configurar Variables de Entorno

Edita el archivo `backend/.env`:

```env
# Puerto del servidor
PORT=3000

# JWT Configuration
JWT_SECRET=tu_jwt_secret_aqui_minimo_32_caracteres_muy_seguros_para_produccion
JWT_EXPIRES_IN=2h

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=contraseña_de_postgres
DB_NAME=voidshop

# Encryption Key (32 bytes en hex = 64 caracteres)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

**IMPORTANTE**: Reemplaza `contraseña_de_postgres` con la contraseña que creaste durante la instalación de PostgreSQL.

---

## Paso 5: Probar la Conexión

Después de que actualicemos el código del backend (siguiente paso), podrás probar:

1. **Iniciar el servidor**:
   ```powershell
   cd backend
   node index.js
   ```

2. **Deberías ver**:
   ```
   ✅ Conectado a PostgreSQL (Base de datos: voidshop)
   🚀 Backend en http://localhost:3000
   📚 Swagger UI en http://localhost:3000/api-docs
   ```

3. **Si hay error**, verifica:
   - PostgreSQL está corriendo (búscalo en "Servicios" de Windows)
   - La contraseña en `.env` es correcta
   - El puerto 5432 no está bloqueado por el firewall
   - La base de datos `voidshop` existe

---

## Herramientas Útiles

### pgAdmin 4 (Ya instalado)
- **Propósito**: Interfaz gráfica para gestionar PostgreSQL
- **Uso**: Ver tablas, ejecutar queries, importar/exportar datos
- **Acceso**: Busca "pgAdmin 4" en el menú inicio

### Comandos psql útiles

```sql
-- Ver todas las bases de datos
\l

-- Conectarse a una base de datos
\c voidshop

-- Ver todas las tablas
\dt

-- Ver estructura de una tabla
\d users

-- Ver datos de una tabla
SELECT * FROM users;

-- Salir
\q
```

---

## Solución de Problemas Comunes

### Error: "psql: command not found"
**Solución**: Agrega PostgreSQL al PATH de Windows:
1. Busca "Variables de entorno" en Windows
2. Edita la variable "Path"
3. Agrega: `C:\Program Files\PostgreSQL\16\bin`
4. Reinicia PowerShell

### Error: "password authentication failed"
**Solución**: 
1. La contraseña en `.env` no coincide
2. Verifica la contraseña en pgAdmin
3. Puedes resetear la contraseña del usuario `postgres`

### Error: "database voidshop does not exist"
**Solución**: 
1. Abre pgAdmin o psql
2. Ejecuta: `CREATE DATABASE voidshop;`

### Error: "Connection refused port 5432"
**Solución**:
1. Abre "Servicios" de Windows (services.msc)
2. Busca "postgresql-x64-16"
3. Clic derecho → "Iniciar"

### Error: "role postgres does not exist"
**Solución**: El usuario se creó con otro nombre durante la instalación
1. Verifica en pgAdmin qué usuarios existen
2. Actualiza `DB_USER` en `.env`

---