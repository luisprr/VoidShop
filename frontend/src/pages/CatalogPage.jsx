// frontend/src/pages/CatalogPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { getProducts, addToCart } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CatalogPage() {
  const { t } = useTranslation();
  const { cartItems, favorites, toggleFavorite, showNotification, loadCartFromBackend } = useCart();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [priceFilter, setPriceFilter] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function matchCategory(p) {
    if (categoryFilter === "Todas") return true;
    const cat = (p.category || p.categoria || "").toLowerCase();
    return cat === categoryFilter.toLowerCase();
  }

  function matchPrice(p) {
    const price = Number(p.price ?? p.precio ?? 0);
    if (priceFilter === "all") return true;
    if (priceFilter === "lt200") return price < 200;
    if (priceFilter === "200-400") return price >= 200 && price <= 400;
    if (priceFilter === "gt400") return price > 400;
    return true;
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery) {
        const name = (p.name || p.nombre || "").toLowerCase();
        const category = (p.category || p.categoria || "").toLowerCase();
        const query = searchQuery.toLowerCase();
        if (!name.includes(query) && !category.includes(query)) {
          return false;
        }
      }
      
      if (!matchCategory(p)) return false;
      if (!matchPrice(p)) return false;
      if (inStockOnly && (p.stock ?? p.stockDisponible ?? 0) <= 0) return false;
      return true;
    });
  }, [products, categoryFilter, priceFilter, inStockOnly, searchQuery]);

  async function handleAddToCart(product) {
    if (!user || !token) {
      alert(t('cart.loginRequired') || "Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    const id = product.id ?? product._id;
    const stock = product.stock ?? product.stockDisponible ?? 0;
    
    const existing = cartItems.find((item) => item.id === id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + 1 > stock) {
      alert(t('cart.stockExceeded') || "Has seleccionado más del stock disponible.");
      return;
    }

    try {
      const newQuantity = currentQty + 1;
      await addToCart(id, newQuantity, token);
      await loadCartFromBackend();
      showNotification(`${product.name ?? product.nombre} agregado al carrito`);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      showNotification(error.message || "Error al agregar al carrito", "error");
    }
  }

  function handleClearFilters() {
    setCategoryFilter("Todas");
    setPriceFilter("all");
    setInStockOnly(false);
  }

  function handleProductClick(product) {
    setSelectedProduct(product);
  }

  function handleCloseModal() {
    setSelectedProduct(null);
  }

  function handleAddToCartFromModal(product, quantity = 1) {
    if (!user) {
      alert(t('cart.loginRequired') || "Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    const id = product.id ?? product._id;
    const stock = product.stock ?? product.stockDisponible ?? 0;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + quantity > stock) {
        alert(t('cart.stockExceeded') || "Has seleccionado más del stock disponible.");
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
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
          quantity,
        },
      ];
    });

    showNotification(`${product.name ?? product.nombre} agregado al carrito`);
  }

  return (
    <div className="vs-page">
      <div className="vs-page-layout">
        {/* SIDEBAR DE FILTROS */}
        <aside className="vs-filters-panel">
          <h2 className="vs-page-title">{t('catalog.filters')}</h2>
          <p className="vs-page-subtitle">
            {t('catalog.filtersDescription') || 'Refina el catálogo por categoría, precio, disponibilidad o tus favoritos.'}
          </p>

          <div className="vs-filters">
            {/* Categoría */}
            <div className="vs-filter-section">
              <div className="vs-filter-title">{t('catalog.category')}</div>
              <div className="vs-filter-chip-group">
                {["Todas", "Hombre", "Mujer", "Unisex", "Accesorio", "Juguete", "Aparatos Electrónicos", "Calzado"].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={
                        "vs-filter-chip" +
                        (categoryFilter === cat ? " vs-filter-chip--active" : "")
                      }
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Precio */}
            <div className="vs-filter-section">
              <div className="vs-filter-title">{t('catalog.priceRange')}</div>
              <div className="vs-filter-chip-group vs-filter-chip-group--column">
                <button
                  type="button"
                  className={
                    "vs-filter-chip vs-filter-chip--full" +
                    (priceFilter === "all" ? " vs-filter-chip--active" : "")
                  }
                  onClick={() => setPriceFilter("all")}
                >
                  {t('catalog.anyPrice') || 'Cualquier precio'}
                </button>
                <button
                  type="button"
                  className={
                    "vs-filter-chip vs-filter-chip--full" +
                    (priceFilter === "lt200" ? " vs-filter-chip--active" : "")
                  }
                  onClick={() => setPriceFilter("lt200")}
                >
                  {t('catalog.upTo200') || 'Hasta S/ 200'}
                </button>
                <button
                  type="button"
                  className={
                    "vs-filter-chip vs-filter-chip--full" +
                    (priceFilter === "200-400" ? " vs-filter-chip--active" : "")
                  }
                  onClick={() => setPriceFilter("200-400")}
                >
                  {t('catalog.between200And400') || 'S/ 200 – S/ 400'}
                </button>
                <button
                  type="button"
                  className={
                    "vs-filter-chip vs-filter-chip--full" +
                    (priceFilter === "gt400" ? " vs-filter-chip--active" : "")
                  }
                  onClick={() => setPriceFilter("gt400")}
                >
                  {t('catalog.moreThan400') || 'Más de S/ 400'}
                </button>
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="vs-filter-section">
              <div className="vs-filter-title">{t('catalog.availability') || 'Disponibilidad'}</div>
              <div className="vs-filter-checkbox-row">
                <label className="vs-filter-checkbox">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  {t('catalog.inStockOnly') || 'Solo productos con stock'}
                </label>
              </div>
              <button
                type="button"
                className="vs-filter-clear-btn"
                onClick={handleClearFilters}
              >
                {t('catalog.clearFilters') || 'Limpiar filtros'}
              </button>
            </div>
          </div>
        </aside>

        {/* LISTA DE PRODUCTOS */}
        <section className="vs-panel vs-panel--catalog">
          <div className="vs-panel-header">
            <div>
              <h3 className="vs-panel-title">
                {searchQuery ? `${t('catalog.resultsFor')} "${searchQuery}"` : t('catalog.title')}
              </h3>
              <p className="vs-panel-subtitle">
                {searchQuery 
                  ? t('catalog.productsFound', { count: filteredProducts.length })
                  : t('catalog.description')
                }
              </p>
            </div>
            <button
              type="button"
              className="vs-secondary-btn"
              onClick={loadProducts}
            >
              {t('catalog.refresh') || 'Actualizar'}
            </button>
          </div>

          {loading && (
            <p className="vs-status-text">{t('common.loading')}</p>
          )}
          {error && (
            <p className="vs-status-text" style={{ color: "#fecaca" }}>
              {error}
            </p>
          )}

          <div className="vs-grid">
            {filteredProducts.map((product) => {
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
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(id);
                    }}
                    aria-label={t('catalog.addToFavorites') || 'Añadir a favoritos'}
                  >
                    ♥
                  </button>

                  {/* Imagen - clickeable */}
                  <div 
                    className="vs-card-image-wrapper vs-card-image-wrapper--square"
                    onClick={() => handleProductClick(product)}
                    style={{ cursor: 'pointer' }}
                  >
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

                  {/* Texto - clickeable */}
                  <div 
                    className="vs-card-header"
                    onClick={() => handleProductClick(product)}
                    style={{ cursor: 'pointer' }}
                  >
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
                      {isOutOfStock ? t('catalog.outOfStock') || 'Sin stock' : t('catalog.addToCart')}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* MODAL DE PRODUCTO */}
      {selectedProduct && (
        <div className="vs-modal-overlay" onClick={handleCloseModal}>
          <div className="vs-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="vs-modal-close" onClick={handleCloseModal} aria-label={t('common.close')}>
              ✕
            </button>

            <div className="vs-modal-body">
              {/* Imagen */}
              <div className="vs-modal-image">
                {selectedProduct.imageUrl || selectedProduct.imagenUrl ? (
                  <img
                    src={selectedProduct.imageUrl ?? selectedProduct.imagenUrl}
                    alt={selectedProduct.name ?? selectedProduct.nombre}
                  />
                ) : (
                  <div className="vs-modal-image-placeholder" />
                )}
              </div>

              {/* Info */}
              <div className="vs-modal-info">
                <div className="vs-modal-header">
                  <h2 className="vs-modal-title">
                    {selectedProduct.name ?? selectedProduct.nombre}
                  </h2>
                </div>

                {(selectedProduct.category || selectedProduct.categoria) && (
                  <div style={{ marginBottom: "1rem" }}>
                    <span className="vs-chip">
                      {String(selectedProduct.category ?? selectedProduct.categoria).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="vs-modal-price">
                  S/. {Number(selectedProduct.price ?? selectedProduct.precio ?? 0).toFixed(2)}
                </div>

                <div className="vs-modal-stock">
                  {t('product.stock')}: <strong>{selectedProduct.stock ?? selectedProduct.stockDisponible ?? 0}</strong>
                </div>

                <div className="vs-modal-description">
                  <h3>{t('product.description')}</h3>
                  <p>
                    {(selectedProduct.description || selectedProduct.descripcion) 
                      ? (selectedProduct.description ?? selectedProduct.descripcion)
                      : t('product.noDescription') || "Sin descripción disponible"}
                  </p>
                </div>

                <div className="vs-modal-actions">
                  <button
                    className={`vs-fav-btn-large${favorites.includes(selectedProduct.id ?? selectedProduct._id) ? ' active' : ''}`}
                    onClick={() => toggleFavorite(selectedProduct.id ?? selectedProduct._id)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.includes(selectedProduct.id ?? selectedProduct._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {favorites.includes(selectedProduct.id ?? selectedProduct._id) ? t('product.inFavorites') || 'En favoritos' : t('product.addToFavorites') || 'Agregar a favoritos'}
                  </button>
                  
                  <button
                    className="vs-primary-btn"
                    disabled={(selectedProduct.stock ?? selectedProduct.stockDisponible ?? 0) <= 0}
                    onClick={() => {
                      handleAddToCartFromModal(selectedProduct, 1);
                    }}
                  >
                    {(selectedProduct.stock ?? selectedProduct.stockDisponible ?? 0) <= 0 ? t('catalog.outOfStock') || 'Sin stock' : t('catalog.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
