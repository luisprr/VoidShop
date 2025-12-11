# VoidShop - Frontend Documentation

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Características Principales](#características-principales)
5. [Configuración e Instalación](#configuración-e-instalación)
6. [Arquitectura y Patrones](#arquitectura-y-patrones)
7. [Componentes Principales](#componentes-principales)
8. [Gestión de Estado](#gestión-de-estado)
9. [Rutas y Navegación](#rutas-y-navegación)
10. [Internacionalización (i18n)](#internacionalización-i18n)
11. [Integración con Backend](#integración-con-backend)
12. [Estilos y Diseño Responsivo](#estilos-y-diseño-responsivo)
13. [Autenticación y Autorización](#autenticación-y-autorización)
14. [Manejo de Errores](#manejo-de-errores)
15. [Optimizaciones](#optimizaciones)
16. [Despliegue](#despliegue)
17. [Buenas Prácticas](#buenas-prácticas)

---

## Descripción General

VoidShop es una aplicación de e-commerce desarrollada con React 19 que proporciona una experiencia de compra completa con las siguientes funcionalidades:

- Catálogo de productos con filtros y búsqueda
- Sistema de carrito de compras sincronizado con backend
- Gestión de favoritos persistente
- Perfiles de usuario con direcciones y métodos de pago
- Panel de administración para gestión de productos, órdenes y cupones
- Sistema de cupones de descuento
- Internacionalización (Español/Inglés)
- Diseño completamente responsivo
- Sistema de notificaciones toast

## Tecnologías Utilizadas

### Core

- **React 19.0.0** - Framework principal
- **React Router DOM 7.1.1** - Enrutamiento y navegación
- **Vite 7.2.4** - Build tool y dev server

### Estado y Contexto

- **React Context API** - Gestión de estado global
- **React Hooks** - useState, useEffect, useMemo, useRef, useContext

### Internacionalización

- **i18next 24.2.1** - Framework de traducción
- **react-i18next 15.2.2** - Integración con React
- **i18next-browser-languagedetector 8.0.2** - Detección automática de idioma

### Estilística

- **CSS Modules** - Estilos con alcance local
- **Custom Properties CSS** - Variables de diseño
- **Media Queries** - Diseño responsivo

### Desarrollo

- **ESLint 9.18.0** - Linting y calidad de código
- **@vitejs/plugin-react 4.3.4** - Plugin de React para Vite

## Estructura del Proyecto

```
frontend/
├── public/                     # Archivos estáticos
├── src/
│   ├── api.js                 # Cliente API (legacy, migrar a services)
│   ├── App.jsx                # Componente raíz con rutas
│   ├── App.css                # Estilos globales (4500+ líneas)
│   ├── index.css              # Reset y estilos base
│   ├── main.jsx               # Punto de entrada
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── AuthErrorHandler.jsx    # Manejo global de errores 401
│   │   ├── FiltersSidebar.jsx      # Filtros de catálogo
│   │   ├── Footer.jsx              # Footer con acordeón móvil
│   │   ├── ProtectedAdminRoute.jsx # HOC para rutas admin
│   │   └── SiteHeader.jsx          # Header con menu hamburguesa
│   │
│   ├── context/               # Contextos de React
│   │   ├── AuthContext.jsx         # Autenticación y usuario
│   │   └── CartContext.jsx         # Carrito y favoritos
│   │
│   ├── i18n/                  # Internacionalización
│   │   └── config.js               # Configuración i18next (300+ keys)
│   │
│   ├── layout/                # Layouts de página
│   │   └── Layout.jsx              # Layout principal con header/footer
│   │
│   ├── pages/                 # Páginas de la aplicación
│   │   ├── AdminDashboardPage.jsx  # Panel de administración
│   │   ├── AdminLoginPage.jsx      # Login de administradores
│   │   ├── CartPage.jsx            # Página de carrito
│   │   ├── CatalogPage.jsx         # Catálogo de productos
│   │   ├── FavoritesPage.jsx       # Productos favoritos
│   │   ├── LoginPage.jsx           # Login de clientes
│   │   ├── ProductDetailPage.jsx   # Detalle de producto
│   │   ├── ProfilePage.jsx         # Perfil de usuario
│   │   └── RegisterPage.jsx        # Registro de usuarios
│   │
│   ├── services/              # Servicios y utilidades
│   │   ├── api.js                  # Funciones de API centralizadas
│   │   └── authStore.js            # Almacenamiento de auth (legacy)
│   │
│   └── views/                 # Vistas especializadas
│       ├── AdminView.jsx           # Vista de administración
│       └── CustomerView.jsx        # Vista de cliente
│
├── .env                       # Variables de entorno (local)
├── .env.example               # Plantilla de variables
├── eslint.config.js           # Configuración ESLint
├── index.html                 # HTML principal
├── package.json               # Dependencias y scripts
├── README.md                  # Documentación básica
└── vite.config.js             # Configuración de Vite
```

## Características Principales

### 1. Sistema de Autenticación

- **Login/Registro** de usuarios y administradores
- **JWT Tokens** almacenados en localStorage
- **Rutas protegidas** con ProtectedAdminRoute
- **Detección automática de sesión expirada**
- **Cierre de sesión automático** en errores 401

### 2. Catálogo de Productos

- **Grid responsivo** de productos
- **Filtros múltiples**: categoría, precio, disponibilidad
- **Búsqueda en tiempo real**
- **Vista detallada** de productos
- **Gestión de stock** visual
- **Agregar a carrito/favoritos** con validación

### 3. Carrito de Compras

- **Sincronización con backend** (PostgreSQL)
- **Actualización de cantidades** en tiempo real
- **Validación de stock** antes de agregar
- **Aplicación de cupones** con descuentos
- **Cálculo automático** de subtotal y total
- **Confirmación de orden** con backend

### 4. Sistema de Favoritos

- **Persistencia en backend**
- **Toggle rápido** desde catálogo
- **Página dedicada** de favoritos
- **Sincronización entre dispositivos**

### 5. Perfil de Usuario

- **Gestión de información personal**
- **Múltiples direcciones de envío**
- **Métodos de pago encriptados**
- **Historial de órdenes**
- **Visualización de estado de órdenes**

### 6. Panel de Administración

- **CRUD completo de productos**
- **Gestión de órdenes**
- **Sistema de cupones**
- **Estadísticas básicas**
- **Actualización de estados de órdenes**

### 7. Internacionalización

- **Soporte para Español e Inglés**
- **300+ traducciones**
- **Detección automática de idioma**
- **Cambio dinámico sin recargar**
- **Persistencia en localStorage**

### 8. Diseño Responsivo

- **5 breakpoints principales**:
  - Desktop: 1200px+
  - Tablets grandes: 960px - 1200px
  - Tablets: 768px - 960px
  - Móviles grandes: 480px - 768px
  - Móviles pequeños: 360px - 480px
- **Menu hamburguesa** en móvil
- **Footer con acordeón** en móvil
- **Grid adaptativo** en todas las vistas

## Configuración e Instalación

### Requisitos Previos

- Node.js 18+ y npm
- Backend de VoidShop corriendo en puerto 3000

### Instalación

```bash
# 1. Navegar al directorio frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

### Variables de Entorno

Archivo `.env`:

```env
# URL del backend API
VITE_API_URL=http://localhost:3000/api
```

Para producción:

```env
VITE_API_URL=https://tu-backend.com/api
```

### Scripts Disponibles

```bash
# Desarrollo (puerto 5173 o 5174 si está ocupado)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## Arquitectura y Patrones

### 1. Arquitectura de Componentes

```
App (Router Provider)
├── Layout
│   ├── SiteHeader
│   │   ├── Logo
│   │   ├── Búsqueda
│   │   ├── Menú Hamburguesa
│   │   └── Navegación
│   ├── Pages (Routes)
│   │   ├── CatalogPage
│   │   │   ├── FiltersSidebar
│   │   │   └── ProductGrid
│   │   ├── CartPage
│   │   ├── ProfilePage
│   │   └── AdminDashboardPage
│   └── Footer
└── AuthErrorHandler (Global)
```

### 2. Patrón de Contextos

**AuthContext**: Gestiona autenticación global

```javascript
{
  user,           // Usuario actual
  token,          // JWT token
  loading,        // Estado de carga
  register(),     // Registrar usuario
  login(),        // Iniciar sesión
  logout(),       // Cerrar sesión
  updateUser(),   // Actualizar datos
  isAdmin         // Flag de admin
}
```

**CartContext**: Gestiona carrito y favoritos

```javascript
{
  cartItems,              // Items en carrito
  favorites,              // IDs de favoritos
  setCartItems(),         // Actualizar carrito
  toggleFavorite(),       // Toggle favorito
  clearCart(),            // Vaciar carrito
  showNotification(),     // Mostrar toast
  dismissNotification(),  // Cerrar toast
  loadingCart,            // Estado de carga
  loadingFavorites,       // Estado de carga
  loadCartFromBackend(),  // Sincronizar carrito
  loadFavoritesFromBackend() // Sincronizar favoritos
}
```

### 3. Patrón de Servicios

Todas las llamadas al API centralizadas en `services/api.js`:

```javascript
// Productos
getProducts()
createProduct(producto, token)
updateProduct(id, producto, token)
deleteProduct(id, token)

// Autenticación
apiRegister({ name, email, password })
apiLogin({ email, password })

// Carrito
getCart(token)
addToCart(productId, quantity, token)
updateCartItem(productId, quantity, token)
removeFromCart(productId, token)
clearCart(token)

// Favoritos
getFavorites(token)
getFavoriteIds(token)
addToFavorites(productId, token)
removeFromFavorites(productId, token)
toggleFavorite(productId, token)
```

### 4. Patrón de Hooks Personalizados

```javascript
// useAuth - Acceso al contexto de autenticación
const { user, token, login, logout } = useAuth();

// useCart - Acceso al contexto de carrito
const { cartItems, toggleFavorite } = useCart();

// useTranslation - Acceso a traducciones
const { t, i18n } = useTranslation();
```

### 5. Patrón de Rutas Protegidas

```javascript
// HOC para proteger rutas de admin
<ProtectedAdminRoute>
  <AdminDashboardPage />
</ProtectedAdminRoute>
```

## Componentes Principales

### SiteHeader.jsx

Componente de encabezado principal con:

- Logo y navegación
- Búsqueda de productos
- Selector de idioma
- Carrito e indicadores
- Menú hamburguesa responsivo
- Sidebar deslizante en móvil

**Estados principales**:
```javascript
mobileMenuOpen      // Control del menú móvil
showLangMenu        // Menú de idiomas
searchQuery         // Término de búsqueda
```

**Funcionalidades**:
- Navegación responsive
- Búsqueda con navegación
- Cambio de idioma dinámico
- Cerrar sesión
- Bloqueo de scroll cuando menú abierto

### Footer.jsx

Footer con acordeón en móvil:

- Información de la empresa
- Enlaces rápidos
- Ayuda y soporte
- Legal y políticas
- Redes sociales

**Estados**:
```javascript
openSections {
  about: boolean,
  quickLinks: boolean,
  help: boolean,
  legal: boolean
}
```

**Responsive**:
- Desktop: Grid de 4 columnas
- Móvil: Acordeón colapsable

### FiltersSidebar.jsx

Panel de filtros para catálogo:

- Filtro por categoría
- Filtro por precio
- Solo con stock
- Botón de limpiar filtros

**Props**:
```javascript
{
  categories,           // Array de categorías
  selectedCategory,     // Categoría actual
  onCategoryChange,     // Callback
  priceFilter,          // Rango de precio
  onPriceFilterChange,  // Callback
  inStockOnly,          // Solo con stock
  onStockFilterChange,  // Callback
  onClearFilters        // Limpiar todo
}
```

### ProtectedAdminRoute.jsx

HOC para proteger rutas administrativas:

```javascript
if (!user) return <Navigate to="/login" />
if (user.role !== 'admin') return <Navigate to="/" />
return children
```

### AuthErrorHandler.jsx

Componente invisible que intercepta errores 401:

- Escucha todos los fetch globalmente
- Detecta tokens expirados
- Cierra sesión automáticamente
- Redirige al login

**Funcionalidad**:
```javascript
// Intercepta window.fetch
// Si response.status === 401
//   y message contiene "token"
//   entonces logout() y navigate("/login")
```

## Gestión de Estado

### Estado Local (useState)

Usado para:
- Estados de formularios
- Toggles de UI (modales, menús)
- Estados de carga
- Mensajes de error/éxito

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [formData, setFormData] = useState({ name: "", email: "" });
```

### Estado Global (Context)

**AuthContext**:
- Usuario autenticado
- Token JWT
- Funciones de autenticación

**CartContext**:
- Items del carrito
- Productos favoritos
- Notificaciones toast

### Estado Derivado (useMemo)

Optimización de cálculos costosos:

```javascript
// Filtrado de productos
const filteredProducts = useMemo(() => {
  return products.filter(matchFilters);
}, [products, filters]);

// Cálculos de carrito
const totals = useMemo(() => {
  return calculateTotals(cartItems, discount);
}, [cartItems, discount]);
```

### Persistencia

**localStorage**:
- Token JWT: `vs_token`
- Usuario: `vs_user`
- Idioma: `language`

**Backend (PostgreSQL)**:
- Carrito de compras
- Favoritos
- Perfil de usuario
- Órdenes

## Rutas y Navegación

### Definición de Rutas

```javascript
<Routes>
  {/* Públicas */}
  <Route path="/" element={<CatalogPage />} />
  <Route path="/catalog" element={<CatalogPage />} />
  <Route path="/product/:id" element={<ProductDetailPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Autenticadas */}
  <Route path="/cart" element={<CartPage />} />
  <Route path="/favorites" element={<FavoritesPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  
  {/* Admin */}
  <Route path="/admin/login" element={<AdminLoginPage />} />
  <Route path="/admin" element={
    <ProtectedAdminRoute>
      <AdminDashboardPage />
    </ProtectedAdminRoute>
  } />
  
  {/* Catch-all */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Navegación Programática

```javascript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Navegación simple
navigate("/catalog");

// Navegación con reemplazo
navigate("/login", { replace: true });

// Navegación con estado
navigate("/product/123", { state: { from: "/cart" } });

// Navegación atrás
navigate(-1);
```

### Parámetros de Ruta

```javascript
// URL: /product/123
const { id } = useParams();

// URL: /catalog?q=laptop&category=electronics
const [searchParams] = useSearchParams();
const query = searchParams.get("q");
const category = searchParams.get("category");
```

## Internacionalización (i18n)

### Configuración

**i18n/config.js** contiene:

- Configuración de i18next
- 300+ traducciones en español e inglés
- Detección automática de idioma
- Fallback a español

**Categorías de traducciones**:
- `header`: Navegación y UI global
- `footer`: Enlaces y secciones del footer
- `catalog`: Catálogo y filtros
- `product`: Detalle de productos
- `cart`: Carrito de compras
- `favorites`: Favoritos
- `profile`: Perfil de usuario
- `admin`: Panel administrativo
- `auth`: Login y registro

### Uso en Componentes

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  // Traducción simple
  const title = t('catalog.title');
  
  // Traducción con interpolación
  const welcome = t('header.welcome', { name: user.name });
  
  // Traducción con plural
  const items = t('cart.items', { count: cartItems.length });
  
  // Cambiar idioma
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  return <h1>{title}</h1>;
}
```

### Estructura de Traducciones

```javascript
{
  es: {
    translation: {
      header: {
        catalog: "Catálogo",
        cart: "Carrito",
        favorites: "Favoritos",
        // ...
      },
      catalog: {
        title: "Catálogo de Productos",
        filters: "Filtros",
        // ...
      }
    }
  },
  en: {
    translation: {
      header: {
        catalog: "Catalog",
        cart: "Cart",
        favorites: "Favorites",
        // ...
      }
    }
  }
}
```

### Cambio de Idioma

Desde el header:

```javascript
<button onClick={() => changeLanguage('es')}>
  Español
</button>
<button onClick={() => changeLanguage('en')}>
  English
</button>
```

El idioma se guarda en localStorage y persiste entre sesiones.

## Integración con Backend

### Configuración de API

**URL Base**:
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
```

### Manejo de Respuestas

**handleResponse()**:
```javascript
async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    // Manejo especial de 401 (sesión expirada)
    if (res.status === 401) {
      if (message.includes("token")) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    throw new Error(message);
  }
  
  return data;
}
```

### Autenticación en Requests

```javascript
// Con token
const response = await fetch(`${API_URL}/cart`, {
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
});

// Sin token (endpoints públicos)
const response = await fetch(`${API_URL}/products`);
```

### Funciones de API Principales

**Productos**:
```javascript
await getProducts()
await createProduct(producto, token)
await updateProduct(id, producto, token)
await deleteProduct(id, token)
```

**Carrito**:
```javascript
await getCart(token)
await addToCart(productId, quantity, token)
await updateCartItem(productId, quantity, token)
await removeFromCart(productId, token)
await clearCart(token)
```

**Favoritos**:
```javascript
await getFavorites(token)
await getFavoriteIds(token)
await toggleFavorite(productId, token)
```

**Órdenes**:
```javascript
await createOrder({ items, total, couponCode }, token)
```

### Manejo de Errores

```javascript
try {
  const data = await getProducts();
  setProducts(data);
} catch (error) {
  console.error("Error:", error);
  setError(error.message);
  showNotification(error.message, "error");
}
```

## Estilos y Diseño Responsivo

### Variables CSS

```css
:root {
  /* Colores principales */
  --vs-bg-main: #0a0f06;
  --vs-bg-panel: #15190e;
  --vs-green-main: #6b7132;
  --vs-accent-gold: #f4d48b;
  
  /* Texto */
  --vs-text-main: #e8e8d8;
  --vs-text-soft: #b0b098;
  --vs-text-muted: #87876d;
  
  /* Bordes */
  --vs-border-soft: rgba(107, 113, 50, 0.2);
  
  /* Transiciones */
  --vs-transition: all 0.3s ease;
}
```

### Breakpoints Responsive

```css
/* Desktop grande: >1200px */
@media (max-width: 1200px) { }

/* Tablets grandes: 960px - 1200px */
@media (max-width: 960px) { }

/* Tablets: 768px - 960px */
@media (max-width: 768px) { }

/* Móviles grandes: 480px - 768px */
@media (max-width: 480px) { }

/* Móviles pequeños: <480px */
@media (max-width: 360px) { }
```

### Grid Adaptativo

```css
/* Desktop */
.vs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* Tablets */
@media (max-width: 960px) {
  .vs-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

/* Móvil */
@media (max-width: 768px) {
  .vs-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
```

### Menu Hamburguesa

```css
/* Desktop: Oculto */
.vs-hamburger {
  display: none !important;
}

/* Móvil: Visible */
@media (max-width: 960px) {
  .vs-hamburger {
    display: flex !important;
  }
  
  /* Sidebar */
  .vs-header-right {
    position: fixed;
    right: -100%;
    transition: right 0.3s ease;
  }
  
  .vs-mobile-menu-open {
    right: 0;
  }
}
```

### Footer Acordeón

```css
/* Desktop: Grid normal */
.vs-footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
}

/* Móvil: Acordeón */
@media (max-width: 768px) {
  .vs-footer-col {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .vs-footer-content-wrapper {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
  
  .vs-footer-col--open .vs-footer-content-wrapper {
    max-height: 500px;
  }
}
```

## Autenticación y Autorización

### Flujo de Autenticación

**1. Login**:
```javascript
const { user, token } = await apiLogin({ email, password });
setUser(user);
setToken(token);
// localStorage automático por useEffect
```

**2. Almacenamiento**:
```javascript
useEffect(() => {
  if (token) {
    localStorage.setItem("vs_token", token);
  }
}, [token]);
```

**3. Verificación**:
```javascript
// AuthContext carga token al iniciar
const [token, setToken] = useState(() => {
  return localStorage.getItem("vs_token") || null;
});
```

**4. Logout**:
```javascript
function logout() {
  setUser(null);
  setToken(null);
  // localStorage se limpia automáticamente
}
```

### Rutas Protegidas

**Admin**:
```javascript
function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  
  return children;
}
```

**Autenticadas**:
```javascript
// En el componente
if (!user || !token) {
  navigate("/login");
  return;
}
```

### Detección de Sesión Expirada

**AuthErrorHandler.jsx**:
```javascript
// Intercepta todos los fetch
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  if (response.status === 401) {
    const message = await response.text();
    if (message.includes("token")) {
      logout();
      navigate("/login");
    }
  }
  
  return response;
};
```

**handleResponse en api.js**:
```javascript
if (res.status === 401) {
  if (message.includes("token")) {
    localStorage.clear();
    window.location.href = "/login";
  }
}
```

## Manejo de Errores

### Niveles de Error

**1. Errores de API**:
```javascript
try {
  await apiFunction();
} catch (error) {
  console.error("API Error:", error);
  setError(error.message);
  showNotification(error.message, "error");
}
```

**2. Errores de Validación**:
```javascript
if (quantity > stock) {
  setCartError("Stock insuficiente");
  return;
}
```

**3. Errores de Autenticación**:
```javascript
// Manejados automáticamente por AuthErrorHandler
// y handleResponse()
```

### Sistema de Notificaciones

**Toast Notifications**:
```javascript
// Mostrar
showNotification("Producto agregado al carrito", "success");
showNotification("Error al procesar", "error");

// Estructura
{
  id: number,
  message: string,
  type: "success" | "error"
}

// Auto-dismiss después de 4 segundos
```

**Implementación en CartContext**:
```javascript
const [notifications, setNotifications] = useState([]);

function showNotification(message, type = "success") {
  const id = notificationIdCounter.current++;
  setNotifications(prev => [...prev, { id, message, type }]);
  
  setTimeout(() => {
    dismissNotification(id);
  }, 4000);
}
```

### Manejo de Estados de Carga

```javascript
const [loading, setLoading] = useState(false);

async function fetchData() {
  try {
    setLoading(true);
    setError("");
    const data = await apiCall();
    setData(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

// En el render
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
```

## Optimizaciones

### 1. useMemo para Cálculos Costosos

```javascript
// Filtrado de productos
const filteredProducts = useMemo(() => {
  return products.filter(product => {
    // Lógica de filtrado compleja
  });
}, [products, filters]);

// Totales de carrito
const totals = useMemo(() => {
  const subtotal = cartItems.reduce(...);
  const discount = subtotal * discountPercent;
  return { subtotal, discount, total };
}, [cartItems, discountPercent]);
```

### 2. Lazy Loading de Rutas

```javascript
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => 
  import('./pages/AdminDashboardPage')
);

<Suspense fallback={<Loading />}>
  <AdminDashboard />
</Suspense>
```

### 3. Debouncing en Búsqueda

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery) {
      navigate(`/?q=${searchQuery}`);
    }
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchQuery]);
```

### 4. Sincronización Eficiente

```javascript
// Solo cargar carrito cuando hay usuario y token
useEffect(() => {
  if (user && token) {
    loadCartFromBackend();
    loadFavoritesFromBackend();
  }
}, [user, token]);
```

### 5. Prevención de Re-renders

```javascript
// useRef para valores que no necesitan re-render
const notificationIdCounter = useRef(0);

// Callbacks memorizados
const handleClick = useCallback(() => {
  // Lógica
}, [dependencies]);
```

## Despliegue

### Build de Producción

```bash
# Crear build optimizado
npm run build

# Resultado en /dist
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── index.html
```

### Variables de Entorno para Producción

```env
VITE_API_URL=https://api.voidshop.com/api
```

### Plataformas de Deploy

**Vercel**:
```bash
npm install -g vercel
vercel
```

**Netlify**:
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Railway**:
```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Configuración de Vite para Producción

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next']
        }
      }
    }
  }
});
```

### Optimizaciones de Build

**Code Splitting**:
- Vendor chunks separados
- Lazy loading de rutas
- Dynamic imports

**Asset Optimization**:
- Minificación CSS/JS
- Tree shaking
- Compression (gzip/brotli)

## Buenas Prácticas

### Estructura de Componentes

**DO**:
```javascript
// Componente con responsabilidad única
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={() => onAddToCart(product)}>
        Agregar
      </button>
    </div>
  );
}
```

**DON'T**:
```javascript
// Componente que hace demasiado
function ProductCard() {
  // Lógica de API, estado global, render complejo
  // Todo mezclado
}
```

### Manejo de Estado

**DO**:
```javascript
// Estado cerca de donde se usa
function MyComponent() {
  const [localState, setLocalState] = useState();
  // ...
}
```

**DON'T**:
```javascript
// Todo en Context innecesariamente
// Causa re-renders en toda la app
```

### Llamadas a API

**DO**:
```javascript
// Funciones centralizadas en services/
import { getProducts } from '../services/api';

const data = await getProducts();
```

**DON'T**:
```javascript
// fetch directo en componentes
fetch('http://localhost:3000/api/products')
```

### Manejo de Errores

**DO**:
```javascript
try {
  await operation();
} catch (error) {
  console.error(error);
  showNotification(error.message, "error");
}
```

**DON'T**:
```javascript
// Silenciar errores
operation().catch(() => {});
```

### Traducciones

**DO**:
```javascript
const { t } = useTranslation();
<h1>{t('catalog.title')}</h1>
```

**DON'T**:
```javascript
// Texto hardcodeado
<h1>Catálogo de Productos</h1>
```

### Responsive Design

**DO**:
```css
/* Mobile-first approach */
.component {
  width: 100%;
}

@media (min-width: 768px) {
  .component {
    width: 50%;
  }
}
```

**DON'T**:
```css
/* Desktop-first (menos mantenible) */
.component {
  width: 50%;
}

@media (max-width: 767px) {
  .component {
    width: 100%;
  }
}
```

### Performance

**DO**:
```javascript
// Usar useMemo para cálculos costosos
const filtered = useMemo(() => 
  items.filter(complex), 
  [items]
);
```

**DON'T**:
```javascript
// Calcular en cada render
const filtered = items.filter(complex);
```

## Troubleshooting

### Problema: "Cannot connect to backend"

**Solución**:
1. Verificar que backend esté corriendo en puerto 3000
2. Verificar VITE_API_URL en .env
3. Revisar CORS en backend

### Problema: "Token expired" constante

**Solución**:
1. Verificar JWT_SECRET en backend
2. AuthErrorHandler debe cerrar sesión automáticamente
3. Re-login del usuario

### Problema: Carrito no persiste

**Solución**:
1. Verificar que usuario esté autenticado
2. Revisar que backend tenga tabla cart_items
3. Ver logs de sincronización en CartContext

### Problema: Traducciones no funcionan

**Solución**:
1. Verificar import de useTranslation
2. Revisar que la key exista en i18n/config.js
3. Limpiar caché del navegador

### Problema: Estilos no aplican

**Solución**:
1. Verificar especificidad CSS
2. Revisar media queries
3. Usar !important solo cuando sea necesario
4. Inspeccionar con DevTools

## Recursos Adicionales

### Documentación

- React: https://react.dev
- React Router: https://reactrouter.com
- Vite: https://vitejs.dev
- i18next: https://www.i18next.com

### Herramientas de Desarrollo

- React DevTools (extensión de navegador)
- Redux DevTools (si se migra a Redux)
- Vite DevTools

### Testing (Futuro)

Recomendaciones para implementar:

- **Vitest**: Testing framework
- **React Testing Library**: Testing de componentes
- **MSW**: Mock Service Worker para APIs
- **Cypress**: E2E testing

---

**Versión**: 1.0.0
**Última actualización**: Diciembre 2025
**Licencia**: Privado
