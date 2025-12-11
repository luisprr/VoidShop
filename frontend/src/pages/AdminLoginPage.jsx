// frontend/src/pages/AdminLoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import "../App.css";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@voidshop.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleBack() {
    navigate(-1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const { user } = await login({ email, password });

      if (user.role !== "admin") {
        setError(t('adminLogin.notAdmin'));
        return;
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
    }
  }

  return (
    <div className="vs-page">
      <section className="vs-auth-container">
        <div className="vs-auth-card vs-auth-card--admin">
          <div className="vs-auth-header">
            <button
              type="button"
              className="vs-secondary-btn vs-secondary-btn--small"
              onClick={handleBack}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px", marginBottom: "1px" }}>
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              {t('adminLogin.back')}
            </button>
            <div className="vs-auth-icon vs-auth-icon--admin">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="vs-auth-title">{t('adminLogin.title')}</h1>
            <p className="vs-auth-subtitle">
              {t('adminLogin.subtitle') || 'Panel de control exclusivo. Gestiona productos, usuarios, cupones y órdenes.'}
            </p>
            <div className="vs-auth-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px", marginBottom: "1px" }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {t('adminLogin.restricted') || 'Acceso Restringido'}
            </div>
          </div>

          <form className="vs-auth-form" onSubmit={handleSubmit}>
            <div className="vs-field">
              <label className="vs-label">{t('adminLogin.email')}</label>
              <input
                type="email"
                className="vs-input"
                placeholder="admin@voidshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="vs-field">
              <label className="vs-label">{t('adminLogin.password')}</label>
              <input
                type="password"
                className="vs-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="vs-status-error vs-status-error--small">
                {error}
              </div>
            )}

            <button className="vs-primary-btn vs-primary-btn--wide" type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('adminLogin.button')}
            </button>

            <div className="vs-auth-footer">
              <p className="vs-auth-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px", marginBottom: "1px" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                {t('adminLogin.note') || 'Solo cuentas con rol'} <strong>admin</strong> {t('adminLogin.canAccess') || 'pueden acceder'}
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
