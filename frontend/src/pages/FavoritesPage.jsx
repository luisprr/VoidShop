// frontend/src/pages/FavoritesPage.jsx
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useCart } from "../context/CartContext";
import { getProducts } from "../services/api";
import { Link } from "react-router-dom";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { favorites, toggleFavorite, cartItems, setCartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const favoriteProducts = products.filter((p) =>
    favorites.includes(p.id ?? p._id)
  );

  function handleAddToCart(product) {
    const id = product.id ?? product._id;
    const stock = product.stock ?? product.stockDisponible ?? 0;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + 1 > stock) {
        alert(t('catalog.stockExceeded') || "Has seleccionado más del stock disponible.");
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...prev,
        {
          id,
          name: product.name ?? product.nombre,
          price: product.price ?? product.precio ?? 0,
          imageUrl: product.imageUrl ?? product.imagenUrl ?? "",
          stock,
          quantity: 1,
        },
      ];
    });
  }

  return (
    <div className="vs-page">
      <div className="vs-panel vs-panel--catalog">
        <div className="vs-panel-header">
          <div>
            <h3 className="vs-panel-title">{t('favorites.title')}</h3>
            <p className="vs-panel-subtitle">
              {t('favorites.description')}
            </p>
          </div>
          <Link to="/" className="vs-secondary-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t('cart.backToCatalog')}
          </Link>
        </div>

        {loading && <p className="vs-status-text">{t('common.loading')}</p>}

        {!loading && favoriteProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p className="vs-status-text">
              {t('favorites.empty')}
            </p>
            <Link to="/" className="vs-primary-btn" style={{ marginTop: "20px", display: "inline-block" }}>
              {t('favorites.exploreCatalog')}
            </Link>
          </div>
        )}

        <div className="vs-grid">
          {favoriteProducts.map((product) => {
            const id = product.id ?? product._id;
            const name = product.name ?? product.nombre;
            const price = Number(product.price ?? product.precio ?? 0);
            const stock = product.stock ?? product.stockDisponible ?? 0;
            const category = product.category ?? product.categoria;
            const imageUrl = product.imageUrl ?? product.imagenUrl;

            const isFav = favorites.includes(id);
            const isOutOfStock = stock <= 0;

            return (
              <article className="vs-card vs-card--with-fav" key={id}>
                {/* Botón favoritos */}
                <button
                  type="button"
                  className={
                    "vs-fav-btn" + (isFav ? " vs-fav-btn--active" : "")
                  }
                  onClick={() => toggleFavorite(id)}
                  aria-label={t('favorites.removeFromFavorites')}
                >
                  ♥
                </button>

                {/* Imagen */}
                <div className="vs-card-image-wrapper vs-card-image-wrapper--square">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name}
                      className="vs-card-image"
                    />
                  ) : (
                    <div className="vs-card-image vs-card-image--placeholder" />
                  )}
                </div>

                {/* Texto */}
                <div className="vs-card-header">
                  <h4 className="vs-card-title">{name}</h4>
                  {category && (
                    <span className="vs-chip">
                      {String(category).toUpperCase()}
                    </span>
                  )}
                </div>

                <p className="vs-card-price">
                  S/. {price.toFixed ? price.toFixed(2) : price}
                </p>
                <p className="vs-card-stock">
                  {t('product.stock')}{" "}
                  <span className="vs-card-stock-number">{stock}</span>
                </p>

                <div className="vs-card-actions">
                  <button
                    type="button"
                    className={
                      "vs-primary-btn" +
                      (isOutOfStock ? " vs-primary-btn--disabled" : "")
                    }
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(product)}
                  >
                    {isOutOfStock ? t('catalog.outOfStock') : t('favorites.addToCart')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
