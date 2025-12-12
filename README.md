# VoidShop

Aplicacion completa de e-commerce desarrollada con React 19, Express.js y PostgreSQL.

Link de VoidShop: [https://voidshop28.netlify.app/](https://voidshop28.netlify.app/)

Link de documentación swagger: [https://voidshop-backend.onrender.com/api-docs/](https://voidshop-backend.onrender.com/api-docs/)

## Descripcion

VoidShop es una plataforma de comercio electronico moderna que permite a los usuarios navegar por un catalogo de productos, gestionar su carrito de compras, agregar productos a favoritos y realizar ordenes. Incluye un panel de administracion completo para la gestion de productos, ordenes y cupones de descuento.

**Estructura del Monorepo**:
```
voidshop/
├── backend/          # API REST con Express + PostgreSQL
└── frontend/         # SPA con React 19 + Vite
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

---

**Version**: 1.0.0
**Fecha**: Diciembre 2025
**Autor:** Luis Rodríguez
