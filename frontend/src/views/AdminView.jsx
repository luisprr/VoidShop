// frontend/src/views/AdminView.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function AdminView() {
  // ===== Auth (para token) =====
  const { token } = useAuth();
  const { t } = useTranslation();

  // ===== Productos =====
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Variable para verificar si estamos editando
  const isEditing = editingId != null;

  // ===== Órdenes =====
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState("");

  // ===== Cupones =====
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [errorCoupons, setErrorCoupons] = useState("");
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount: "",
  });
  const [savingCoupon, setSavingCoupon] = useState(false);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadCoupons();
  }, []);

  // ============================
  // Productos
  // ============================
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

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  }

  function resetForm() {
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      imageUrl: "",
    });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorProducts("");

    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      setErrorProducts("Completa todos los campos obligatorios.");
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock);
    if (isNaN(price) || isNaN(stock)) {
      setErrorProducts("Precio y stock deben ser numéricos.");
      return;
    }

    if (!token) {
      setErrorProducts("No hay token de administrador.");
      return;
    }

    try {
      setSubmitting(true);

      const url = isEditing
        ? `${API_URL}/products/${editingId}`
        : `${API_URL}/products`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price,
          stock,
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.message ||
            (isEditing
              ? "No se pudo actualizar el producto."
              : "No se pudo crear el producto.")
        );
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setErrorProducts(err.message || "Error al guardar producto");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setFormData({
      name: product.name || "",
      category: product.category || "",
      price: String(product.price || ""),
      stock: String(product.stock || ""),
      description: product.description || "",
      imageUrl: product.imageUrl || "",
    });
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!window.confirm(t('admin.deleteConfirm'))) return;

    if (!token) {
      setErrorProducts("No hay token de administrador.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo eliminar el producto.");
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setErrorProducts(err.message || "Error al eliminar producto");
    }
  }

  // ============================
  // Órdenes
  // ============================
  async function loadOrders() {
    try {
      setLoadingOrders(true);
      setErrorOrders("");
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("No se pudieron cargar las órdenes");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setErrorOrders(err.message || "Error al cargar órdenes");
    } finally {
      setLoadingOrders(false);
    }
  }

  // ============================
  // Cupones
  // ============================
  async function loadCoupons() {
    try {
      setLoadingCoupons(true);
      setErrorCoupons("");
      const res = await fetch(`${API_URL}/coupons`);
      if (!res.ok) throw new Error("No se pudieron cargar los cupones");
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      setErrorCoupons(err.message || "Error al cargar cupones");
    } finally {
      setLoadingCoupons(false);
    }
  }

  function handleCouponChange(e) {
    const { name, value } = e.target;
    setCouponForm((f) => ({ ...f, [name]: value }));
  }

  async function handleCouponSubmit(e) {
    e.preventDefault();
    setErrorCoupons("");

    const code = couponForm.code.trim();
    const discount = Number(couponForm.discount);

    if (!code || !couponForm.discount) {
      setErrorCoupons("Completa código y descuento.");
      return;
    }

    if (!Number.isFinite(discount) || discount <= 0 || discount >= 1) {
      setErrorCoupons("El descuento debe ser un número entre 0 y 1 (ej. 0.25).");
      return;
    }

    if (!token) {
      setErrorCoupons("No hay token de administrador.");
      return;
    }

    try {
      setSavingCoupon(true);
      const res = await fetch(`${API_URL}/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          code, 
          discountType: 'percentage',
          discountValue: discount * 100
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo crear el cupón.");
      }

      setCouponForm({ code: "", discount: "" });
      await loadCoupons();
    } catch (err) {
      setErrorCoupons(err.message || "Error al crear cupón");
    } finally {
      setSavingCoupon(false);
    }
  }

  async function handleCouponDelete(code) {
    if (!window.confirm(`¿Eliminar el cupón "${code}"?`)) return;

    if (!token) {
      setErrorCoupons("No hay token de administrador.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/coupons/${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo eliminar el cupón.");
      }

      setCoupons((prev) => prev.filter((c) => c.code !== code));
    } catch (err) {
      setErrorCoupons(err.message || "Error al eliminar cupón");
    }
  }

  return (
    <div className="vs-admin-container">
      {/* Productos */}
      <section className="vs-admin-section">
        <div className="vs-admin-section-header">
          <div>
            <h2 className="vs-admin-section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              {t('admin.managementTitle')}
            </h2>
            <p className="vs-admin-section-subtitle">
              {t('admin.managementSubtitle')}
            </p>
          </div>
          <button className="vs-secondary-btn" onClick={loadProducts} disabled={loadingProducts}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {t('admin.refresh')}
          </button>
        </div>

        {errorProducts && (
          <div className="vs-status-error" style={{ marginBottom: "1.5rem" }}>
            {errorProducts}
          </div>
        )}

        <div className="vs-admin-products-layout">
          {/* Formulario */}
          <div className="vs-admin-form-card">
            <h3 className="vs-admin-form-title">
              {isEditing ? t('admin.editProduct') : t('admin.newProduct')}
            </h3>
            <form className="vs-admin-form" onSubmit={handleSubmit}>
              <div className="vs-form-group">
                <label>{t('admin.name')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('admin.productName')}
                />
              </div>

              <div className="vs-form-row">
                <div className="vs-form-group">
                  <label>{t('admin.priceLabel')}</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="vs-form-group">
                  <label>{t('admin.stockLabel')}</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="vs-form-group">
                <label>Categoría</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Accesorio">Accesorio</option>
                  <option value="Juguete">Juguete</option>
                  <option value="Aparatos Electrónicos">Aparatos Electrónicos</option>
                  <option value="Calzado">Calzado</option>
                </select>
              </div>

              <div className="vs-form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Descripción del producto..."
                />
              </div>

              <div className="vs-form-group">
                <label>URL de imagen</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="vs-form-actions">
                <button type="submit" className="vs-primary-btn" disabled={submitting}>
                  {submitting ? t('common.saving') : isEditing ? t('common.update') : t('common.create')}
                </button>
                {isEditing && (
                  <button type="button" className="vs-secondary-btn" onClick={resetForm}>
                    {t('common.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de productos */}
          <div className="vs-admin-products-grid">
            {loadingProducts && !products.length ? (
              <div className="vs-admin-empty">Cargando...</div>
            ) : !products.length ? (
              <div className="vs-admin-empty">No hay productos</div>
            ) : (
              products.map((p) => (
                <div key={p.id} className="vs-admin-product-card">
                  {p.imageUrl && (
                    <div className="vs-product-image">
                      <img src={p.imageUrl} alt={p.name} />
                    </div>
                  )}
                  <div className="vs-product-info">
                    <div className="vs-product-header">
                      <h4>{p.name}</h4>
                      <span className="vs-badge">{p.category}</span>
                    </div>
                    <div className="vs-product-meta">
                      <span className="vs-price">S/. {Number(p.price).toFixed(2)}</span>
                      <span className="vs-stock">Stock: {p.stock}</span>
                    </div>
                    <div className="vs-product-actions">
                      <button className="vs-btn-icon" onClick={() => handleEdit(p)} title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="vs-btn-icon vs-btn-danger" onClick={() => handleDelete(p.id)} title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Órdenes y Cupones - Layout lado a lado */}
      <div className="vs-admin-two-columns">
        {/* Órdenes */}
        <section className="vs-admin-section">
          <div className="vs-admin-section-header">
            <div>
              <h2 className="vs-admin-section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {t('admin.recentOrders')}
              </h2>
            </div>
            <button className="vs-secondary-btn" onClick={loadOrders} disabled={loadingOrders}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {t('admin.update')}
            </button>
          </div>

          {errorOrders && <div className="vs-status-error">{errorOrders}</div>}

          <div className="vs-admin-orders-list">
            {loadingOrders && !orders.length ? (
              <div className="vs-admin-empty">{t('admin.loadingOrders')}</div>
            ) : !orders.length ? (
              <div className="vs-admin-empty">{t('admin.noOrders')}</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="vs-admin-order-card">
                  <div className="vs-order-header">
                    <h4>{t('admin.order')} #{order.code || order.id}</h4>
                    <span className="vs-badge">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {order.user && (
                    <div className="vs-order-user">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>{order.user.name || t('admin.user')}</span>
                      <span className="vs-order-email">{order.user.email}</span>
                    </div>
                  )}

                  <div className="vs-order-total">
                    <span>{t('admin.total')}:</span>
                    <strong>S/. {Number(order.total).toFixed(2)}</strong>
                  </div>

                  {order.couponCode && (
                    <div className="vs-order-coupon">
                      {t('admin.coupon')}: <strong>{order.couponCode}</strong>
                    </div>
                  )}

                  <div className="vs-order-items">
                    {order.items?.map((it, idx) => {
                      const itemName = it.name || it.productName || it.product?.name || 'Producto';
                      const itemPrice = it.price || it.productPrice || it.product?.price || 0;
                      return (
                        <div key={idx} className="vs-order-item">
                          <span>{it.quantity || 1}×</span>
                          <span>{itemName}</span>
                          <span>S/. {Number(itemPrice).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Cupones */}
        <section className="vs-admin-section">
          <div className="vs-admin-section-header">
            <div>
              <h2 className="vs-admin-section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }}>
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <path d="M3 10h18"/>
                </svg>
                {t('admin.coupons')}
              </h2>
            </div>
            <button className="vs-secondary-btn" onClick={loadCoupons} disabled={loadingCoupons}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {t('admin.update')}
            </button>
          </div>

          {errorCoupons && <div className="vs-status-error">{errorCoupons}</div>}

          <form className="vs-admin-form" onSubmit={handleCouponSubmit} style={{ marginBottom: "1.5rem" }}>
            <div className="vs-form-group">
              <label>{t('admin.code')}</label>
              <input
                type="text"
                name="code"
                value={couponForm.code}
                onChange={handleCouponChange}
                required
                placeholder="VERANO25"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div className="vs-form-group">
              <label>{t('admin.discountPercent')}</label>
              <input
                type="number"
                name="discount"
                value={couponForm.discount}
                onChange={handleCouponChange}
                step="0.01"
                min="0"
                max="1"
                required
                placeholder="0.25"
              />
              <small style={{ color: "var(--vs-text-muted)", fontSize: "0.85rem" }}>
                {t('common.example', 'Ej')}: 0.25 = 25% {t('common.discount', 'de descuento')}
              </small>
            </div>
            <button type="submit" className="vs-primary-btn" disabled={savingCoupon}>
              {savingCoupon ? t('common.loading') : t('admin.saveCoupon')}
            </button>
          </form>

          <div className="vs-admin-coupons-list">
            {loadingCoupons && !coupons.length ? (
              <div className="vs-admin-empty">{t('admin.loadingCoupons')}</div>
            ) : !coupons.length ? (
              <div className="vs-admin-empty">{t('admin.noCoupons')}</div>
            ) : (
              coupons.map((c) => (
                <div key={c.code} className="vs-admin-coupon-card">
                  <div className="vs-coupon-info">
                    <strong>{c.code}</strong>
                    <span className="vs-coupon-discount">{Number(c.discount_value || 0).toFixed(0)}% OFF</span>
                  </div>
                  <button className="vs-btn-icon vs-btn-danger" onClick={() => handleCouponDelete(c.code)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}