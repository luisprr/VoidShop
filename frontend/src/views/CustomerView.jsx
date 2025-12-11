// frontend/src/views/CustomerView.jsx
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function CustomerView({
  favorites = [],
  onToggleFavorite,
  showOnlyFavorites = false,
  filters,
  onSelectProduct,
}) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState("");
  const [cartError, setCartError] = useState("");

  const { cartItems, setCartItems } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      setErrorProducts("");
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error("No se pudieron cargar los productos");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setErrorProducts(err.message || "Error al cargar productos");
    } finally {
      setLoadingProducts(false);
    }
  }

  function handleAddToCart(product) {
    setCartError("");

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + 1;

      if (newQty > product.stock) {
        setCartError(
          `Has seleccionado más unidades de "${product.name}" que el stock disponible (stock máximo: ${product.stock}).`
        );
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          stock: product.stock,
          imageUrl: product.imageUrl || null,
        },
      ];
    });
  }

  // ============================
  // Filtros (categoría, precio, stock, favoritos)
  // ============================
  const category = filters?.category || "all";
  const priceFilter = filters?.price || "all";
  const inStockOnly = filters?.inStockOnly || false;

  let displayedProducts = products.slice();

  if (category !== "all") {
    displayedProducts = displayedProducts.filter((p) => p.category === category);
  }

  if (inStockOnly) {
    displayedProducts = displayedProducts.filter((p) => p.stock > 0);
  }

  if (priceFilter === "low") {
    displayedProducts = displayedProducts.filter((p) => Number(p.price) <= 200);
  } else if (priceFilter === "mid") {
    displayedProducts = displayedProducts.filter(
      (p) => Number(p.price) > 200 && Number(p.price) <= 400
    );
  } else if (priceFilter === "high") {
    displayedProducts = displayedProducts.filter((p) => Number(p.price) > 400);
  }

  if (showOnlyFavorites) {
    if (favorites.length === 0) {
      displayedProducts = [];
    } else {
      displayedProducts = displayedProducts.filter((p) =>
        favorites.includes(p.id)
      );
    }
  }

  const showingFavorites = showOnlyFavorites;

  return (
    <section className="vs-panel vs-products">
      <div className="vs-section-header">
        <div>
          <h2 className="vs-section-title">
            {showingFavorites ? "Tus favoritos" : "Catálogo"}
          </h2>
          <p className="vs-section-subtitle">
            {showingFavorites
              ? "Solo estás viendo los productos que marcaste con ♥."
              : "Explora nuestras piezas en rojo profundo. Añade productos a tu carrito respetando siempre el stock disponible."}
          </p>
        </div>
        <button
          type="button"
          className="vs-refresh-btn"
          onClick={loadProducts}
          disabled={loadingProducts}
        >
          {loadingProducts ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {cartError && (
        <div className="vs-status-error vs-status-error--small">
          {cartError}
        </div>
      )}

      {errorProducts && (
        <div className="vs-status-error">{errorProducts}</div>
      )}

      {loadingProducts && !displayedProducts.length ? (
        <p className="vs-status-text">Cargando productos...</p>
      ) : displayedProducts.length ? (
        <div className="vs-grid">
          {displayedProducts.map((p) => {
            const isFavorite = favorites.includes(p.id);

            return (
              <article
                key={p.id}
                className="vs-card vs-card--clickable vs-card--with-fav"
                onClick={() => onSelectProduct && onSelectProduct(p)}
              >
                {/* Botón favorito */}
                {typeof onToggleFavorite === "function" && (
                  <button
                    type="button"
                    className={
                      "vs-fav-btn" + (isFavorite ? " vs-fav-btn--active" : "")
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(p.id);
                    }}
                    title={
                      isFavorite
                        ? "Quitar de favoritos"
                        : "Añadir a favoritos"
                    }
                  >
                    {isFavorite ? "♥" : "♡"}
                  </button>
                )}

                {p.imageUrl && (
                  <div className="vs-card-image-wrapper vs-card-image-wrapper--square">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="vs-card-image"
                    />
                  </div>
                )}

                <div className="vs-card-header">
                  <h3 className="vs-card-title">{p.name}</h3>
                  <span className="vs-chip">{p.category}</span>
                </div>
                <p className="vs-card-price">
                  S/. {Number(p.price).toFixed(2)}
                </p>
                <p className="vs-card-stock">
                  Stock{" "}
                  <span className="vs-card-stock-number">{p.stock}</span>
                </p>

                <button
                  type="button"
                  className="vs-primary-btn vs-primary-btn--small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(p);
                  }}
                  disabled={p.stock <= 0}
                >
                  {p.stock <= 0 ? "Sin stock" : "Añadir al carrito"}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        !loadingProducts &&
        !errorProducts && (
          <p className="vs-status-text">
            {showingFavorites
              ? "Aún no tienes productos en favoritos. Toca el ♥ en un producto para añadirlo."
              : "No hay productos registrados aún."}
          </p>
        )
      )}
    </section>
  );
}
