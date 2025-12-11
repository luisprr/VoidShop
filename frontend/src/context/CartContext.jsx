// frontend/src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { 
  getCart, 
  addToCart as apiAddToCart,
  updateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  getFavoriteIds,
  toggleFavorite as apiToggleFavorite
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const notificationIdCounter = useRef(0);

  // Cargar carrito desde el backend cuando el usuario inicia sesión
  useEffect(() => {
    if (user && token) {
      loadCartFromBackend();
      loadFavoritesFromBackend();
    } else {
      setCartItems([]);
      setFavorites([]);
    }
  }, [user, token]);

  async function loadCartFromBackend() {
    if (!token) return;
    try {
      setLoadingCart(true);
      const data = await getCart(token);
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      // Si el error menciona token, no mostrar notificación (el AuthErrorHandler lo maneja)
      if (!error.message?.toLowerCase().includes("token") && 
          !error.message?.toLowerCase().includes("sesión")) {
        setCartItems([]);
      }
    } finally {
      setLoadingCart(false);
    }
  }

  async function loadFavoritesFromBackend() {
    if (!token) return;
    try {
      setLoadingFavorites(true);
      const data = await getFavoriteIds(token);
      setFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      // Si el error menciona token, no mostrar notificación (el AuthErrorHandler lo maneja)
      if (!error.message?.toLowerCase().includes("token") && 
          !error.message?.toLowerCase().includes("sesión")) {
        setFavorites([]);
      }
    } finally {
      setLoadingFavorites(false);
    }
  }

  async function toggleFavorite(productId) {
    if (!user || !token) {
      alert("Debes iniciar sesión para agregar a favoritos.");
      return;
    }

    try {
      const result = await apiToggleFavorite(productId, token);
      
      if (result.action === "added") {
        setFavorites((prev) => [...prev, productId]);
      } else if (result.action === "removed") {
        setFavorites((prev) => prev.filter((id) => id !== productId));
      }
    } catch (error) {
      console.error("Error al alternar favorito:", error);
      showNotification("Error al actualizar favoritos", "error");
    }
  }

  async function clearCart() {
    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      await apiClearCart(token);
      setCartItems([]);
    } catch (error) {
      console.error("Error al vaciar carrito:", error);
      showNotification("Error al vaciar el carrito", "error");
    }
  }

  function showNotification(message, type = "success") {
    const id = notificationIdCounter.current++;
    const newNotification = { id, message, type };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    setTimeout(() => {
      dismissNotification(id);
    }, 4000);
  }

  function dismissNotification(id) {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }

  const value = {
    cartItems,
    setCartItems,
    favorites,
    toggleFavorite,
    clearCart,
    showNotification,
    dismissNotification,
    loadingCart,
    loadingFavorites,
    loadCartFromBackend,
    loadFavoritesFromBackend,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className="vs-toast-container">
        {notifications.map((notification) => (
          <div key={notification.id} className={`vs-toast vs-toast--${notification.type}`}>
            <div className="vs-toast-content">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{notification.message}</span>
              <button 
                className="vs-toast-close" 
                onClick={() => dismissNotification(notification.id)}
                aria-label="Cerrar notificación"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
