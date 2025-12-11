// frontend/src/pages/ProductDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { addToCart } from "../services/api";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, loadCartFromBackend } = useCart();
  const { token } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartError, setCartError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_URL}/products/${id}`);
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Producto no encontrado");
        }
        setProduct(data);
      } catch (err) {
        setError(err.message || "No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  function handleBack() {
    navigate("/catalog");
  }

  async function handleAddToCart() {
    if (!product || !token) {
      setCartError("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    setCartError("");
    setAdding(true);

    try {
      const existing = cartItems.find((item) => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + 1;

      if (newQty > product.stock) {
        setCartError(
          `No puedes añadir más de ${product.stock} unidades de "${product.name}".`
        );
        setAdding(false);
        return;
      }

      await addToCart(product.id, newQty, token);
      await loadCartFromBackend();
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      setCartError(error.message || "Error al agregar al carrito");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="vs-app">
        <div className="vs-background-overlay" />
        <div className="vs-shell">
          <main className="vs-main">
            <p className="vs-status-text">Cargando producto...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="vs-app">
        <div className="vs-background-overlay" />
        <div className="vs-shell">
          <main className="vs-main">
            <section className="vs-panel">
              <p className="vs-status-error">{error || "Error"}</p>
              <button
                type="button"
                className="vs-nav-pill vs-nav-pill--ghost"
                onClick={handleBack}
              >
                Volver al catálogo
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="vs-app">
      <div className="vs-background-overlay" />
      <div className="vs-shell">
        <header className="vs-header">
          <div className="vs-header-bottom">
            <div className="vs-header-bottom-left">
              <div>
                <h1 className="vs-title">{product.name}</h1>
                <p className="vs-subtitle">
                  Detalle del producto. Revisa stock, precio y agrégalo a tu
                  carrito.
                </p>
              </div>
            </div>
            <div className="vs-nav">
              <button
                type="button"
                className="vs-nav-link vs-nav-link--button"
                onClick={handleBack}
              >
                ← Volver al catálogo
              </button>
            </div>
          </div>
        </header>

        <main className="vs-main">
          <section className="vs-panel vs-product-detail">
            <div className="vs-product-detail-grid">
              {product.imageUrl && (
                <div className="vs-product-detail-image">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="vs-card-image"
                  />
                </div>
              )}

              <div className="vs-product-detail-info">
                <div className="vs-product-detail-header">
                  <span className="vs-chip">{product.category}</span>
                  <h2 className="vs-section-title">{product.name}</h2>
                </div>

                <p className="vs-product-detail-price">
                  S/. {Number(product.price).toFixed(2)}
                </p>

                <p className="vs-card-stock">
                  Stock{" "}
                  <span className="vs-card-stock-number">
                    {product.stock}
                  </span>
                </p>

                <p className="vs-product-detail-description">
                  Esta es una pieza destacada de la colección VoidShop. Aquí más
                  adelante podrías mostrar descripción larga, materiales, talla,
                  guía de uso, etc.
                </p>

                {cartError && (
                  <div className="vs-status-error vs-status-error--small">
                    {cartError}
                  </div>
                )}

                <div className="vs-product-detail-actions">
                  <button
                    type="button"
                    className="vs-primary-btn"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || adding}
                  >
                    {product.stock <= 0
                      ? "Sin stock"
                      : adding
                      ? "Añadiendo..."
                      : "Añadir al carrito"}
                  </button>

                  <button
                    type="button"
                    className="vs-nav-pill vs-nav-pill--ghost"
                    onClick={handleBack}
                  >
                    Volver al catálogo
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
