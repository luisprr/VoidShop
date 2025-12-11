// frontend/src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../context/AuthContext";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState("");
  const [orderSortBy, setOrderSortBy] = useState("recent"); 

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [activeTab, setActiveTab] = useState("info");

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [addressForm, setAddressForm] = useState({
    label: "",
    address: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "Perú",
    isDefault: false,
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    cardholderName: "",
    expiry: "",
    cvv: "",
    isDefault: false,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (activeTab === "orders") {
      loadMyOrders();
    }
    if (activeTab === "address") {
      loadAddresses();
    }
    if (activeTab === "payment") {
      loadPaymentMethods();
    }
  }, [user, navigate, activeTab]);

  // ========== ÓRDENES ==========
  async function loadMyOrders() {
    if (!token) return;

    try {
      setLoadingOrders(true);
      setErrorOrders("");

      const res = await fetch(`${API_URL}/orders/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Error al cargar órdenes");
      }

      setOrders(data);
    } catch (err) {
      setErrorOrders(err.message || "Error al cargar tus órdenes");
    } finally {
      setLoadingOrders(false);
    }
  }

  // ========== DIRECCIONES ==========
  async function loadAddresses() {
    if (!token) return;

    try {
      setLoadingAddresses(true);
      const res = await fetch(`${API_URL}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Error al cargar direcciones");
      }

      setAddresses(data);
    } catch (err) {
      console.error("Error al cargar direcciones:", err);
    } finally {
      setLoadingAddresses(false);
    }
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    if (!token) return;

    try {
      const url = editingAddress
        ? `${API_URL}/user/addresses/${editingAddress.id}`
        : `${API_URL}/user/addresses`;
      
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || t('profile.saveAddressError', 'Error al guardar dirección'));
      }

      await loadAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        label: "",
        address: "",
        address2: "",
        city: "",
        postalCode: "",
        country: "Perú",
        isDefault: false,
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteAddress(id) {
    if (!confirm(t('profile.deleteAddressConfirm'))) return;
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/user/addresses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || t('profile.deleteAddressError', 'Error al eliminar dirección'));
      }

      await loadAddresses();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleEditAddress(address) {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      address: address.address,
      address2: address.address2 || "",
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  }

  // ========== MÉTODOS DE PAGO ==========
  async function loadPaymentMethods() {
    if (!token) return;

    try {
      setLoadingPayments(true);
      const res = await fetch(`${API_URL}/user/payment-methods`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Error al cargar métodos de pago");
      }

      setPaymentMethods(data);
    } catch (err) {
      console.error("Error al cargar métodos de pago:", err);
    } finally {
      setLoadingPayments(false);
    }
  }

  async function handleSavePayment(e) {
    e.preventDefault();
    if (!token) return;

    try {
      const [expiryMonth, expiryYear] = paymentForm.expiry.split('/').map(s => s.trim());
      
      const res = await fetch(`${API_URL}/user/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardNumber: paymentForm.cardNumber,
          cardholderName: paymentForm.cardholderName,
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          cvv: paymentForm.cvv,
          cardType: 'Visa',
          isDefault: paymentForm.isDefault
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || t('profile.savePaymentError', 'Error al guardar método de pago'));
      }

      await loadPaymentMethods();
      setShowPaymentForm(false);
      setPaymentForm({
        cardNumber: "",
        cardholderName: "",
        expiry: "",
        cvv: "",
        isDefault: false,
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeletePayment(id) {
    if (!confirm(t('profile.deletePaymentConfirm'))) return;
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/user/payment-methods/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || t('profile.deletePaymentError', 'Error al eliminar método de pago'));
      }

      await loadPaymentMethods();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  // ========== PERFIL ==========
  async function handleSaveProfile() {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Error al actualizar perfil");
      }

      updateUser(profileForm);
      alert("Perfil actualizado correctamente");
      setEditMode(false);
    } catch (err) {
      alert(err.message);
    }
  }

  // ========== HANDLERS ==========
  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setProfileForm(f => ({ ...f, [name]: value }));
  }

  function handleAddressChange(e) {
    const { name, value, type, checked } = e.target;
    setAddressForm(f => ({ 
      ...f, 
      [name]: type === "checkbox" ? checked : value 
    }));
  }

  function handlePaymentChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (name === "expiry") {
      let cleanValue = value.replace(/\D/g, ""); 
      if (cleanValue.length >= 2) {
        cleanValue = cleanValue.slice(0, 2) + "/" + cleanValue.slice(2, 4);
      }
      setPaymentForm(f => ({ ...f, [name]: cleanValue }));
      return;
    }
    
    if (name === "cardNumber") {
      let cleanValue = value.replace(/\D/g, ""); 
      cleanValue = cleanValue.slice(0, 16); 
      let formattedValue = cleanValue.match(/.{1,4}/g)?.join(" ") || cleanValue;
      setPaymentForm(f => ({ ...f, [name]: formattedValue }));
      return;
    }
    
    setPaymentForm(f => ({ 
      ...f, 
      [name]: type === "checkbox" ? checked : value 
    }));
  }

  if (!user) return null;

  return (
    <div className="vs-page">
      {/* Hero Section */}
      <div className="vs-profile-hero">
        <div className="vs-profile-hero-bg"></div>
        <div className="vs-profile-hero-content">
          <div className="vs-profile-hero-avatar">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="vs-profile-hero-info">
            <h1 className="vs-profile-hero-name">{user.name}</h1>
            <p className="vs-profile-hero-email">{user.email}</p>
            {user.role === "admin" && (
              <span className="vs-profile-hero-badge">
                {t('common.admin')}
              </span>
            )}
          </div>
          <button className="vs-profile-logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t('profile.logout')}
          </button>
        </div>
      </div>

      <div className="vs-profile-main">
        {/* Tabs Navigation */}
        <div className="vs-profile-tabs">
          <button
            className={`vs-profile-tab ${activeTab === "info" ? "vs-profile-tab--active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {t('profile.infoTab')}
          </button>
          <button
            className={`vs-profile-tab ${activeTab === "address" ? "vs-profile-tab--active" : ""}`}
            onClick={() => setActiveTab("address")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {t('profile.addressTab')}
          </button>
          <button
            className={`vs-profile-tab ${activeTab === "payment" ? "vs-profile-tab--active" : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {t('profile.paymentsTab')}
          </button>
          <button
            className={`vs-profile-tab ${activeTab === "orders" ? "vs-profile-tab--active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {t('profile.ordersTab')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="vs-profile-content">
          {/* INFORMACIÓN PERSONAL */}
          {activeTab === "info" && (
            <div className="vs-profile-panel">
              <div className="vs-profile-panel-header">
                <h3>{t('profile.personalInfo')}</h3>
                {!editMode && (
                  <button className="vs-primary-btn" onClick={() => setEditMode(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    {t('profile.edit')}
                  </button>
                )}
              </div>

              {!editMode ? (
                <div className="vs-profile-grid">
                  <div className="vs-profile-data-item">
                    <label>{t('profile.name')}</label>
                    <p>{user.name}</p>
                  </div>
                  <div className="vs-profile-data-item">
                    <label>{t('profile.email')}</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="vs-profile-data-item">
                    <label>{t('profile.phone')}</label>
                    <p>{profileForm.phone || t('common.notSpecified', 'No especificado')}</p>
                  </div>
                  <div className="vs-profile-data-item">
                    <label>{t('common.accountType', 'Tipo de Cuenta')}</label>
                    <p>
                      <span className="vs-badge">
                        {user.role === "admin" ? t('common.admin', 'ADMINISTRADOR') : t('common.customer', 'CLIENTE')}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <form className="vs-profile-form-edit">
                  <div className="vs-form-row">
                    <div className="vs-form-group">
                      <label>{t('profile.name')}</label>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleChange}
                        placeholder={t('profile.name')}
                      />
                    </div>
                    <div className="vs-form-group">
                      <label>{t('profile.phone')}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleChange}
                        placeholder="+51 999 999 999"
                      />
                    </div>
                  </div>
                  <div className="vs-form-group">
                    <label>{t('profile.email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="vs-profile-actions">
                    <button
                      type="button"
                      className="vs-primary-btn"
                      onClick={handleSaveProfile}
                    >
                      {t('profile.save')}
                    </button>
                    <button
                      type="button"
                      className="vs-secondary-btn"
                      onClick={() => {
                        setProfileForm({
                          name: user.name,
                          email: user.email,
                          phone: user.phone || "",
                        });
                        setEditMode(false);
                      }}
                    >
                      {t('profile.cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* DIRECCIONES */}
          {activeTab === "address" && (
            <div className="vs-profile-panel">
              <div className="vs-profile-panel-header">
                <h3>{t('profile.addresses')}</h3>
                {!showAddressForm && (
                  <button 
                    className="vs-primary-btn" 
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({
                        label: "",
                        address: "",
                        address2: "",
                        city: "",
                        postalCode: "",
                        country: "Perú",
                        isDefault: false,
                      });
                      setShowAddressForm(true);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    {t('profile.addAddress')}
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form className="vs-profile-form-edit" onSubmit={handleSaveAddress}>
                  <div className="vs-form-group">
                    <label>{t('profile.label')}</label>
                    <input
                      type="text"
                      name="label"
                      value={addressForm.label}
                      onChange={handleAddressChange}
                      placeholder={t('profile.label')}
                      required
                    />
                  </div>
                  <div className="vs-form-group">
                    <label>{t('profile.address')}</label>
                    <input
                      type="text"
                      name="address"
                      value={addressForm.address}
                      onChange={handleAddressChange}
                      placeholder={t('profile.address')}
                      required
                    />
                  </div>
                  <div className="vs-form-group">
                    <label>{t('profile.address2')}</label>
                    <input
                      type="text"
                      name="address2"
                      value={addressForm.address2}
                      onChange={handleAddressChange}
                      placeholder={t('profile.address2')}
                    />
                  </div>
                  <div className="vs-form-row">
                    <div className="vs-form-group">
                      <label>{t('profile.city')}</label>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        placeholder={t('profile.city')}
                        required
                      />
                    </div>
                    <div className="vs-form-group">
                      <label>{t('profile.postalCode')}</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={addressForm.postalCode}
                        onChange={handleAddressChange}
                        placeholder={t('profile.postalCode')}
                        required
                      />
                    </div>
                  </div>
                  <div className="vs-form-group">
                    <label>{t('profile.country')}</label>
                    <select
                      name="country"
                      value={addressForm.country}
                      onChange={handleAddressChange}
                      required
                    >
                      <option value="Perú">Perú</option>
                      <option value="Chile">Chile</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Argentina">Argentina</option>
                    </select>
                  </div>
                  <div className="vs-form-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressChange}
                      />
                      <span>{t('profile.setAsDefault')}</span>
                    </label>
                  </div>
                  <div className="vs-profile-actions">
                    <button type="submit" className="vs-primary-btn">
                      {editingAddress ? t('profile.updateAddress') : t('profile.saveAddress')}
                    </button>
                    <button
                      type="button"
                      className="vs-secondary-btn"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                    >
                      {t('profile.cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {loadingAddresses ? (
                    <div className="vs-loading-state">{t('profile.loading')}</div>
                  ) : addresses.length === 0 ? (
                    <div className="vs-empty-state">
                      <p>{t('profile.noAddresses', 'No tienes direcciones guardadas')}</p>
                    </div>
                  ) : (
                    <div className="vs-addresses-grid">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="vs-address-card">
                          <div className="vs-address-card-header">
                            <h4>{addr.label}</h4>
                            {addr.isDefault && (
                              <span className="vs-default-badge">{t('profile.defaultBadge')}</span>
                            )}
                          </div>
                          <div className="vs-address-card-body">
                            <p>{addr.address}</p>
                            {addr.address2 && <p className="vs-text-muted">{addr.address2}</p>}
                            <p>{addr.city}, {addr.postalCode}</p>
                            <p>{addr.country}</p>
                          </div>
                          <div className="vs-address-card-actions">
                            <button 
                              className="vs-btn-edit"
                              onClick={() => handleEditAddress(addr)}
                            >
                              Editar
                            </button>
                            <button 
                              className="vs-btn-delete"
                              onClick={() => handleDeleteAddress(addr.id)}
                            >
                              {t('profile.deleteAddress')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* MÉTODOS DE PAGO */}
          {activeTab === "payment" && (
            <div className="vs-profile-panel">
              <div className="vs-profile-panel-header">
                <h3>{t('profile.paymentMethods')}</h3>
                {!showPaymentForm && (
                  <button 
                    className="vs-primary-btn" 
                    onClick={() => setShowPaymentForm(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    {t('profile.addPaymentMethod')}
                  </button>
                )}
              </div>

              {showPaymentForm ? (
                <div className="vs-payment-form-professional">
                  {/* Preview de tarjeta */}
                  <div className="vs-payment-card-preview">
                    <div className="vs-payment-card-chip"></div>
                    <div className="vs-payment-preview-number">
                      {paymentForm.cardNumber || "•••• •••• •••• ••••"}
                    </div>
                    <div className="vs-payment-preview-bottom">
                      <div className="vs-payment-preview-name">
                        {paymentForm.cardholderName || t('profile.cardPreviewPlaceholder')}
                      </div>
                      <div className="vs-payment-preview-expiry">
                        <div className="vs-payment-preview-expiry-label">{t('profile.expiresLabel')}</div>
                        <div className="vs-payment-preview-expiry-value">
                          {paymentForm.expiry || "MM/YY"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleSavePayment}>
                    <div className="vs-payment-input-group card-number">
                      <label>{t('profile.cardNumber')}</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentForm.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required
                      />
                    </div>
                    <div className="vs-payment-input-group">
                      <label>{t('profile.cardholderName')}</label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={paymentForm.cardholderName}
                        onChange={handlePaymentChange}
                        placeholder={t('profile.cardholderName')}
                        required
                        style={{ textTransform: "uppercase" }}
                      />
                    </div>
                    <div className="vs-payment-form-row">
                      <div className="vs-payment-input-group">
                        <label>{t('profile.expiry')}</label>
                        <input
                          type="text"
                          name="expiry"
                          value={paymentForm.expiry}
                          onChange={handlePaymentChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </div>
                      <div className="vs-payment-input-group">
                        <label>{t('profile.cvv')}</label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentForm.cvv}
                          onChange={handlePaymentChange}
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                    <div className="vs-form-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={paymentForm.isDefault}
                          onChange={handlePaymentChange}
                        />
                        <span>{t('profile.setAsDefaultPayment')}</span>
                      </label>
                    </div>
                    <div className="vs-profile-actions">
                      <button type="submit" className="vs-primary-btn">
                        {t('profile.savePaymentMethod')}
                      </button>
                      <button
                        type="button"
                        className="vs-secondary-btn"
                        onClick={() => {
                          setShowPaymentForm(false);
                          setPaymentForm({
                            cardNumber: "",
                            cardholderName: "",
                            expiry: "",
                            cvv: "",
                            isDefault: false,
                          });
                        }}
                      >
                        {t('profile.cancel')}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {loadingPayments ? (
                    <div className="vs-loading-state">{t('profile.loading')}</div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="vs-empty-state">
                      <p>{t('profile.noPaymentMethods', 'No tienes métodos de pago guardados')}</p>
                    </div>
                  ) : (
                    <div className="vs-payment-methods-grid">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="vs-payment-card">
                          <div className="vs-payment-card-header">
                            <div className="vs-payment-card-logo">
                              {method.type === "Visa" && (
                                <span className="vs-payment-logo">VISA</span>
                              )}
                              {method.type === "Mastercard" && (
                                <span className="vs-payment-logo">MC</span>
                              )}
                              {method.type === "AmericanExpress" && (
                                <span className="vs-payment-logo">AMEX</span>
                              )}
                            </div>
                            {method.isDefault && (
                              <span className="vs-payment-default-badge">{t('profile.defaultBadge')}</span>
                            )}
                          </div>
                          <div className="vs-payment-card-number">
                            •••• •••• •••• {method.last4}
                          </div>
                          <div className="vs-payment-cardholder">
                            {method.cardholderName}
                          </div>
                          <div className="vs-payment-card-footer">
                            <span>{t('profile.expiresLabel')} {method.expiry}</span>
                            <button
                              className="vs-payment-remove-btn"
                              onClick={() => handleDeletePayment(method.id)}
                            >
                              {t('profile.deletePaymentButton')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* MIS ÓRDENES */}
          {activeTab === "orders" && (
            <div className="vs-profile-panel">
              <div className="vs-profile-panel-header">
                <h3>{t('profile.orderHistory')}</h3>
                <button className="vs-secondary-btn" onClick={loadMyOrders} disabled={loadingOrders}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  {t('common.update')}
                </button>
              </div>

              {errorOrders && <div className="vs-status-error">{errorOrders}</div>}

              {orders.length > 0 && (
                <div className="vs-orders-sort-bar">
                  <div className="vs-orders-count">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>{orders.length} {orders.length === 1 ? t('profile.order', 'orden') : t('profile.ordersPlural', 'órdenes')} {t('common.inTotal', 'en total')}</span>
                  </div>
                  <div className="vs-orders-sort">
                    <label htmlFor="order-sort">{t('profile.sortBy')}:</label>
                    <select 
                      id="order-sort"
                      className="vs-sort-select"
                      value={orderSortBy}
                      onChange={(e) => setOrderSortBy(e.target.value)}
                    >
                      <option value="recent">{t('profile.recent')}</option>
                      <option value="oldest">{t('profile.oldest')}</option>
                      <option value="highest">{t('profile.highest')}</option>
                      <option value="lowest">{t('profile.lowest')}</option>
                    </select>
                  </div>
                </div>
              )}

              {loadingOrders && !orders.length ? (
                <div className="vs-loading-state">{t('profile.loading')}</div>
              ) : !orders.length ? (
                <div className="vs-empty-orders">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  <h4>{t('profile.noOrders')}</h4>
                  <p>{t('profile.noOrdersDescription', 'Comienza a explorar nuestros productos y realiza tu primera compra')}</p>
                  <button className="vs-primary-btn" onClick={() => navigate("/")}>
                    {t('catalog.exploreCatalog', 'Explorar Catálogo')}
                  </button>
                </div>
              ) : (
                <div className="vs-orders-grid">
                  {[...orders]
                    .sort((a, b) => {
                      if (orderSortBy === "recent") {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                      } else if (orderSortBy === "oldest") {
                        return new Date(a.createdAt) - new Date(b.createdAt);
                      } else if (orderSortBy === "highest") {
                        return Number(b.total) - Number(a.total);
                      } else if (orderSortBy === "lowest") {
                        return Number(a.total) - Number(b.total);
                      }
                      return 0;
                    })
                    .map((order, index) => (
                    <div key={order.id} className="vs-order-modern-card">
                      <div className="vs-order-modern-header">
                        <div className="vs-order-modern-number">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          #{order.code || order.id}
                        </div>
                        <div className="vs-order-modern-date">
                          {new Date(order.createdAt).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      {order.couponCode && (
                        <div className="vs-order-coupon-tag">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="5" width="18" height="14" rx="2"/>
                            <path d="M3 10h18"/>
                          </svg>
                          {t('admin.coupon')}: {order.couponCode}
                        </div>
                      )}

                      <div className="vs-order-modern-items">
                        {order.items?.slice(0, 3).map((item, idx) => {
                          const itemName = item.name || item.productName || item.product?.name || t('product.product', 'Producto');
                          const itemPrice = item.price || item.productPrice || item.product?.price || 0;
                          return (
                            <div key={idx} className="vs-order-modern-item">
                              <span className="vs-order-item-qty">{item.quantity || 1}×</span>
                              <span className="vs-order-item-name">{itemName}</span>
                              <span className="vs-order-item-price">S/. {Number(itemPrice).toFixed(2)}</span>
                            </div>
                          );
                        })}
                        {order.items?.length > 3 && (
                          <div className="vs-order-more-items">
                            +{order.items.length - 3} {t('admin.moreProducts')}
                          </div>
                        )}
                      </div>

                      <div className="vs-order-modern-footer">
                        <span className="vs-order-status-badge">{t('admin.completed')}</span>
                        <div className="vs-order-modern-total">
                          S/. {Number(order.total).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
