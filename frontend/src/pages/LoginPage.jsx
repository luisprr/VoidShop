// frontend/src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import "../App.css";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleBack() {
    navigate(-1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Completa tu correo y contraseña.");
      return;
    }

    try {
      const { user } = await login({
        email: form.email,
        password: form.password,
      });

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/catalog");
      }
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    }
  }

  return (
    <div className="vs-page">
      <section className="vs-auth-container">
        <div className="vs-auth-card">
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
              Volver
            </button>
            <div className="vs-auth-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1 className="vs-auth-title">{t('login.title')}</h1>
            <p className="vs-auth-subtitle">
              {t('login.subtitle') || 'Ingresa a tu cuenta de VoidShop y continúa explorando nuestra colección exclusiva.'}
            </p>
          </div>

          <form className="vs-auth-form" onSubmit={handleSubmit}>
            <div className="vs-field">
              <label className="vs-label" htmlFor="email">
                {t('login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="vs-input"
                placeholder="tucorreo@ejemplo.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="vs-field">
              <label className="vs-label" htmlFor="password">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="vs-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="vs-status-error vs-status-error--small">
                {error}
              </div>
            )}

            <button
              className="vs-primary-btn vs-primary-btn--wide"
              type="submit"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('login.button')}
            </button>

            <div className="vs-auth-footer">
              <p className="vs-auth-link-text">
                {t('login.noAccount')}{" "}
                <Link to="/register" className="vs-auth-link">
                  {t('login.register')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
