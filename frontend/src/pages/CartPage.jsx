// frontend/src/pages/CartPage.jsx
import { useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { updateCartItem, removeFromCart } from "../services/api";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, clearCart, loadCartFromBackend } = useCart();
  const { token } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [cartError, setCartError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    );
    const discountAmount = subtotal * discountPercent;
    const total = subtotal - discountAmount;

    return {
      subtotal,
      discountAmount,
      total,
    };
  }, [cartItems, discountPercent]);

  async function handleQuantityChange(id, delta) {
    setCartError("");
    
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      await handleRemove(id);
      return;
    }

    if (newQty > item.stock) {
      setCartError(
        `${item.name} - ${t('cart.maxStock', { stock: item.stock })}`
      );
      return;
    }

    try {
      await updateCartItem(id, newQty, token);
      await loadCartFromBackend();
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      setCartError(error.message || "Error al actualizar el carrito");
    }
  }

  async function handleRemove(id) {
    try {
      await removeFromCart(id, token);
      await loadCartFromBackend();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setCartError(error.message || "Error al eliminar el producto");
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCartError(t('cart.enterCouponCode') || "Ingresa un código de cupón.");
      return;
    }
    if (!cartItems.length) {
      setCartError(t('cart.empty'));
      return;
    }

    try {
      setApplyingCoupon(true);
      setCartError("");
      setOrderMessage("");

      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartTotal: totals.subtotal,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || t('cart.couponInvalid'));
      }

      const discountDecimal = (data.discountValue || 0) / 100;
      setDiscountPercent(discountDecimal);
      setOrderMessage(
        t('cart.couponAppliedWithPercent', { percent: (data.discountValue || 0).toFixed(0) }) || `Cupón aplicado: ${(data.discountValue || 0).toFixed(0)}% de descuento.`
      );
    } catch (err) {
      setDiscountPercent(0);
      setOrderMessage("");
      setCartError(err.message || t('cart.couponError') || "No se pudo aplicar el cupón.");
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function handleConfirmOrder() {
    if (!cartItems.length) {
      setCartError(t('cart.empty'));
      return;
    }

    if (!token) {
      setCartError(t('cart.loginToCheckout') || "Debes iniciar sesión para realizar una compra.");
      return;
    }

    try {
      setConfirming(true);
      setCartError("");
      setOrderMessage("");

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total: totals.total,
          originalTotal: totals.subtotal,
          couponCode: couponCode.trim() || null,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || t('cart.orderError'));
      }

      clearCart();
      setDiscountPercent(0);
      setCouponCode("");
      setOrderMessage(
        t('cart.orderSuccessWithCode', { code: data.code || data.id }) || `Compra realizada con éxito. Código de orden: ${data.code || data.id}.`
      );
    } catch (err) {
      setCartError(err.message || t('cart.orderError'));
    } finally {
      setConfirming(false);
    }
  }

  async function handleClearCart() {
    try {
      await clearCart();
      setDiscountPercent(0);
      setCouponCode("");
      setCartError("");
      setOrderMessage("");
    } catch (error) {
      console.error("Error al vaciar carrito:", error);
      setCartError("Error al vaciar el carrito");
    }
  }

  return (
    <div className="vs-page">
      <section className="vs-panel vs-panel--catalog">
        <div className="vs-panel-header">
          <div>
            <h3 className="vs-panel-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }}>
                <path d="M6 6h15l-1.5 9h-12z"/>
                <circle cx="9" cy="20" r="1.5"/>
                <circle cx="18" cy="20" r="1.5"/>
              </svg>
              {t('cart.title')}
            </h3>
            <p className="vs-panel-subtitle">
              {cartItems.length > 0 
                ? t('cart.itemsInCart', { count: cartItems.length }) || `Tienes ${cartItems.length} producto${cartItems.length > 1 ? 's' : ''} en tu carrito. Revisa los detalles y completa tu compra cuando estés listo.`
                : t('cart.emptyDescription') || '¡Tu carrito está esperando por productos increíbles! Explora nuestro catálogo y encuentra lo que necesitas.'
              }
            </p>
          </div>
          <button 
            type="button"
            className="vs-secondary-btn"
            onClick={() => navigate('/')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t('cart.backToCatalog')}
          </button>
        </div>

        <div className="vs-cart-grid">
          {/* IZQUIERDA: lista de productos */}
          <div className="vs-cart-items">
            <h2 className="vs-section-title vs-section-title--sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              {t('cart.selectedProducts') || 'Productos Seleccionados'} ({cartItems.length})
            </h2>

            {!cartItems.length ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--vs-bg-panel-soft)", borderRadius: "12px" }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 20px", opacity: 0.3 }}>
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <p className="vs-status-text" style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
                  {t('cart.empty')}
                </p>
                <p style={{ color: "var(--vs-text-muted)", marginBottom: "24px", fontSize: "0.9rem" }}>
                  {t('cart.emptyDiscoverProducts') || '¡Descubre productos increíbles en nuestro catálogo!'}
                </p>
                <button 
                  className="vs-primary-btn"
                  onClick={() => navigate('/')}
                >
                  {t('cart.exploreCatalog') || 'Explorar Catálogo'}
                </button>
              </div>
            ) : (
              <ul className="vs-cart-items-list">
                {cartItems.map((item) => (
                  <li key={item.id} className="vs-cart-item-row">
                    {item.image_url && (
                      <div className="vs-cart-item-thumb">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="vs-cart-item-thumb-img"
                        />
                      </div>
                    )}

                    <div className="vs-cart-item-main">
                      <p className="vs-cart-item-name">{item.name}</p>
                      <p className="vs-cart-item-sub">
                        S/. {Number(item.price).toFixed(2)} x{" "}
                        {item.quantity} = S/.{" "}
                        {Number(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="vs-cart-item-stock">
                        {t('cart.maxStock', { stock: item.stock })}
                      </p>
                    </div>

                    <div className="vs-cart-item-actions">
                      <div className="vs-cart-qty-controls">
                        <button
                          type="button"
                          className="vs-qty-btn"
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          -
                        </button>
                        <span className="vs-qty-value">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="vs-qty-btn"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="vs-secondary-btn vs-secondary-btn--small"
                        onClick={() => handleRemove(item.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px", marginBottom: "1px" }}>
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        {t('cart.remove')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* DERECHA: resumen y cupones */}
          <div className="vs-cart-summary">
            <h2 className="vs-section-title vs-section-title--sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              {t('cart.purchaseSummary') || 'Resumen de tu Compra'}
            </h2>

            <div className="vs-cart-summary-block">
              <p>
                <span>{t('cart.subtotal')}:</span>
                <strong>S/. {totals.subtotal.toFixed(2)}</strong>
              </p>
              {discountPercent > 0 && (
                <p>
                  <span>{t('cart.discount')} ({(discountPercent * 100).toFixed(0)}%):</span>
                  <strong style={{ color: "var(--vs-accent-gold)" }}>
                    - S/. {totals.discountAmount.toFixed(2)}
                  </strong>
                </p>
              )}
              <p>
                <span>{t('cart.totalToPay') || 'Total a pagar'}:</span>
                <strong>S/. {totals.total.toFixed(2)}</strong>
              </p>
            </div>

            <div className="vs-cart-summary-block">
              <p className="vs-filter-title" style={{ marginBottom: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "2px" }}>
                  <polyline points="20 6 9 17 4 12"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                {t('cart.applyCoupon')}
              </p>
              <div className="vs-cart-coupon-row">
                <input
                  type="text"
                  className="vs-input"
                  placeholder={t('cart.couponPlaceholder')}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  type="button"
                  className="vs-primary-btn"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                >
                  {applyingCoupon ? t('cart.applying') || 'Aplicando...' : t('cart.apply')}
                </button>
              </div>
            </div>

            {cartError && (
              <div className="vs-status-error vs-status-error--small">
                {cartError}
              </div>
            )}
            {orderMessage && (
              <div className="vs-status-ok vs-status-ok--small">
                {orderMessage}
              </div>
            )}

            <div className="vs-cart-summary-actions">
              <button
                type="button"
                className="vs-primary-btn vs-primary-btn--wide"
                onClick={handleConfirmOrder}
                disabled={confirming || !cartItems.length}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {confirming ? t('cart.processing') || 'Procesando...' : t('cart.confirmPurchase') || 'Confirmar Compra'}
              </button>

              <button
                type="button"
                className="vs-secondary-btn vs-secondary-btn--wide"
                onClick={handleClearCart}
                disabled={!cartItems.length}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                {t('cart.clearCart') || 'Vaciar Carrito'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}