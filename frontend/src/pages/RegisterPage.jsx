// frontend/src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import "../App.css";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
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

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Completa todos los campos.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (form.password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres (demo).");
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/");
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta.");
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <h1 className="vs-auth-title">{t('register.title')}</h1>
            <p className="vs-auth-subtitle">
              {t('register.subtitle') || 'Únete a VoidShop y descubre nuestra colección exclusiva de moda elegante.'}
            </p>
          </div>

          <form className="vs-auth-form" onSubmit={handleSubmit}>
            <div className="vs-field">
              <label className="vs-label" htmlFor="name">
                {t('register.name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="vs-input"
                placeholder="Tu nombre"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="vs-field">
              <label className="vs-label" htmlFor="email">
                {t('register.email')}
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

            <div className="vs-form-row">
              <div className="vs-field" style={{ flex: 1 }}>
                <label className="vs-label" htmlFor="password">
                  {t('register.password')}
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
              <div className="vs-field" style={{ flex: 1 }}>
                <label className="vs-label" htmlFor="confirm">
                  {t('register.confirmPassword')}
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  className="vs-input"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                />
              </div>
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
              {loading ? t('common.loading') : t('register.button')}
            </button>

            <div className="vs-auth-footer">
              <p className="vs-auth-link-text">
                {t('register.hasAccount')}{" "}
                <Link to="/login" className="vs-auth-link">
                  {t('register.login')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
