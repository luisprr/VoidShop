# VoidShop Backend API

API RESTful completa para VoidShop - E-commerce de moda y accesorios.

## Características

- **Autenticación JWT** - Sistema seguro de autenticación con tokens
- **Gestión de Productos** - CRUD completo con imágenes y descripciones
- **Sistema de Órdenes** - Procesamiento de compras con validación de stock
- **Cupones de Descuento** - Validación y aplicación de cupones
- **Perfiles de Usuario** - Gestión de información personal
- **Direcciones Múltiples** - Soporte para múltiples direcciones de envío
- **Métodos de Pago** - Almacenamiento seguro con encriptación AES-256
- **Roles de Usuario** - Sistema de permisos (Admin/Customer)
- **Documentación Swagger** - API completamente documentada

## Requisitos

- Node.js >= 16.x
- npm >= 8.x

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor
npm start
# o en modo desarrollo
npm run dev
```

## Endpoints Principales

### Base URL
```
http://localhost:3000/api
```

### Documentación Swagger
```
http://localhost:3000/api-docs
```

---

## Productos

### `GET /products`
Obtener todos los productos del catálogo.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Vestido rojo seda",
    "category": "Mujer",
    "price": 350.00,
    "stock": 5,
    "imageUrl": "https://...",
    "description": "Elegante vestido de seda..."
  }
]
```

### `GET /products/:id`
Obtener un producto específico por ID.

### `POST /products`
Crear un nuevo producto (requiere autenticación de admin).

**Request Body:**
```json
{
  "name": "Producto nuevo",
  "category": "Hombre",
  "price": 250.00,
  "stock": 10,
  "imageUrl": "https://...",
  "description": "Descripción del producto"
}
```

### `PUT /products/:id`
Actualizar un producto existente (requiere autenticación de admin).

### `DELETE /products/:id`
Eliminar un producto (requiere autenticación de admin).

---

## Órdenes

### `GET /orders`
Obtener todas las órdenes (solo admin).

**Headers:**
```
Authorization: Bearer <token>
```

### `GET /orders/my`
Obtener las órdenes del usuario actual.

**Headers:**
```
Authorization: Bearer <token>
```

### `POST /orders`
Crear una nueva orden.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "name": "Vestido rojo seda",
      "price": 350.00,
      "quantity": 1
    }
  ],
  "total": 262.50,
  "originalTotal": 350.00,
  "couponCode": "12345"
}
```

### `GET /orders/stats`
Obtener estadísticas de ventas (solo admin).

**Response:**
```json
{
  "totalOrders": 15,
  "totalRevenue": 5250.00,
  "averageOrderValue": 350.00,
  "totalProductsSold": 42,
  "recentOrders": [...]
}
```

---

## Cupones

### `GET /coupons`
Listar todos los cupones disponibles.

### `POST /coupons/validate`
Validar un cupón y calcular descuento.

**Request Body:**
```json
{
  "code": "12345",
  "cartTotal": 500.00
}
```

**Response:**
```json
{
  "code": "12345",
  "discountPercent": 0.25,
  "originalTotal": 500.00,
  "discountedTotal": 375.00
}
```

### `POST /coupons`
Crear un nuevo cupón (solo admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "code": "VERANO2025",
  "discount": 0.30
}
```

### `DELETE /coupons/:code`
Eliminar un cupón (solo admin).

---

## Autenticación

### `POST /auth/register`
Registrar un nuevo usuario.

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Usuario registrado con éxito",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "customer"
  }
}
```

### `POST /auth/login`
Iniciar sesión.

**Request Body:**
```json
{
  "email": "admin@voidshop.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin VoidShop",
    "email": "admin@voidshop.com",
    "role": "admin"
  }
}
```

---

## Perfil de Usuario

### `GET /user/profile`
Obtener perfil del usuario actual.

**Headers:**
```
Authorization: Bearer <token>
```

### `PUT /user/profile`
Actualizar perfil del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "email": "juancarlos@example.com"
}
```

---

## Direcciones

### `GET /user/addresses`
Obtener todas las direcciones del usuario.

### `POST /user/addresses`
Agregar una nueva dirección.

**Request Body:**
```json
{
  "street": "Av. Javier Prado 123",
  "city": "Lima",
  "state": "Lima",
  "zipCode": "15047",
  "country": "Perú",
  "isDefault": true
}
```

### `PUT /user/addresses/:id`
Actualizar una dirección.

### `DELETE /user/addresses/:id`
Eliminar una dirección.

---

## Métodos de Pago

### `GET /user/payment-methods`
Obtener métodos de pago del usuario.

**Response:**
```json
[
  {
    "id": 1,
    "cardType": "Visa",
    "last4": "4242",
    "expiryDate": "12/25",
    "cardholderName": "Juan Pérez",
    "isDefault": true
  }
]
```

### `POST /user/payment-methods`
Agregar un nuevo método de pago.

**Request Body:**
```json
{
  "cardNumber": "4242424242424242",
  "expiryDate": "12/25",
  "cvv": "123",
  "cardholderName": "Juan Pérez",
  "isDefault": true
}
```

**Nota de Seguridad:** Los datos de la tarjeta se encriptan con AES-256-CBC antes de almacenarse.

### `DELETE /user/payment-methods/:id`
Eliminar un método de pago.

---

## Seguridad

### Encriptación
- **AES-256-CBC** para datos sensibles (tarjetas de crédito)
- **JWT** con expiración de 2 horas
- Solo se retornan los últimos 4 dígitos de las tarjetas al cliente

### Middleware de Autenticación

#### `authRequired`
Verifica que el usuario esté autenticado con un token válido.

#### `adminOnly`
Verifica que el usuario tenga rol de administrador.

**Uso:**
```javascript
router.get('/admin-only-route', authRequired, adminOnly, (req, res) => {
  // Solo accesible para admins autenticados
});
```

---

## Categorías de Productos

Las categorías disponibles son:
- `Hombre`
- `Mujer`
- `Unisex`
- `Accesorio`
- `Juguete`
- `Aparatos Electrónicos`
- `Calzado`

---

## Datos de Prueba

### Usuario Admin
```
Email: admin@voidshop.com
Password: admin123
```

## Notas Importantes

1. **Base de Datos**: Actualmente usa datos en memoria. Para producción, integrar con MongoDB, PostgreSQL, etc.

2. **Passwords**: Almacenados en texto plano para desarrollo. En producción usar bcrypt.

3. **JWT Secret**: Cambiar `JWT_SECRET` en producción a un valor seguro.

4. **CORS**: Configurado para desarrollo. Ajustar para producción.

5. **Validación**: Agregar validación más robusta con librerías como Joi o express-validator.

---

## Licencia

Luis Rodriguez - VoidShop 2025