// frontend/src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function handleResponse(res) {
  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Si el token es inválido o expiró, cerrar sesión automáticamente
    if (res.status === 401) {
      const message = data?.message || "";
      if (message.toLowerCase().includes("token") || 
          message.toLowerCase().includes("autenticación") ||
          message.toLowerCase().includes("authentication")) {
        // Limpiar localStorage y recargar
        localStorage.removeItem("vs_token");
        localStorage.removeItem("vs_user");
        
        // Mostrar mensaje breve
        console.warn("Sesión expirada. Redirigiendo al login...");
        
        // Recargar la página para que AuthContext detecte que no hay usuario
        window.location.href = "/login";
        
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
      }
    }

    const message = data?.message || "Error en la petición";
    throw new Error(message);
  }

  return data;
}

/* =========================
   PRODUCTOS
   ========================= */

/**
 * Obtiene todos los productos visibles en el catálogo.
 * Usado en CatalogPage.jsx.
 */
export async function getProducts() {
  const res = await fetch(`${API_URL}/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

/**
 * Crea un nuevo producto (vista admin).
 */
export async function createProduct(producto, token) {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(producto),
  });
  return handleResponse(res);
}

/**
 * Actualiza un producto por id (vista admin).
 */
export async function updateProduct(id, producto, token) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(producto),
  });
  return handleResponse(res);
}

/**
 * Elimina un producto (vista admin).
 */
export async function deleteProduct(id, token) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

/* =========================
   AUTENTICACIÓN
   ========================= */

/**
 * Registrar nuevo usuario
 */
export async function apiRegister({ name, email, password }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
}

/**
 * Iniciar sesión
 */
export async function apiLogin({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

/* =========================
   CUPONES / ÓRDENES
   ========================= */

/**
 * Aplica cupón de descuento en el backend (si lo necesitas en el carrito).
 */
export async function applyCoupon(code, total) {
  const res = await fetch(`${API_URL}/coupons/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, total }),
  });
  return handleResponse(res);
}

/**
 * Crea una orden de compra.
 * items: [{ productId, quantity, price }]
 */
export async function createOrder({ items, total, originalTotal, couponCode }) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items,
      total,
      originalTotal,
      couponCode: couponCode || null,
    }),
  });
  return handleResponse(res);
}

/* =========================
   CARRITO DE COMPRAS
   ========================= */

/**
 * Obtener el carrito del usuario autenticado desde el backend
 */
export async function getCart(token) {
  const res = await fetch(`${API_URL}/cart`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

/**
 * Agregar o actualizar un producto en el carrito
 */
export async function addToCart(productId, quantity, token) {
  const res = await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ productId, quantity }),
  });
  return handleResponse(res);
}

/**
 * Actualizar la cantidad de un producto en el carrito
 */
export async function updateCartItem(productId, quantity, token) {
  const res = await fetch(`${API_URL}/cart/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ quantity }),
  });
  return handleResponse(res);
}

/**
 * Eliminar un producto del carrito
 */
export async function removeFromCart(productId, token) {
  const res = await fetch(`${API_URL}/cart/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

/**
 * Vaciar todo el carrito
 */
export async function clearCart(token) {
  const res = await fetch(`${API_URL}/cart`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

/* =========================
   FAVORITOS
   ========================= */

/**
 * Obtener lista completa de productos favoritos
 */
export async function getFavorites(token) {
  const res = await fetch(`${API_URL}/favorites`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

/**
 * Obtener solo los IDs de productos favoritos
 */
export async function getFavoriteIds(token) {
  const res = await fetch(`${API_URL}/favorites/ids`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

/**
 * Agregar un producto a favoritos
 */
export async function addToFavorites(productId, token) {
  const res = await fetch(`${API_URL}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ productId }),
  });
  return handleResponse(res);
}

/**
 * Eliminar un producto de favoritos
 */
export async function removeFromFavorites(productId, token) {
  const res = await fetch(`${API_URL}/favorites/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

/**
 * Alternar un producto en favoritos (agregar si no existe, quitar si existe)
 */
export async function toggleFavorite(productId, token) {
  const res = await fetch(`${API_URL}/favorites/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ productId }),
  });
  return handleResponse(res);
}
