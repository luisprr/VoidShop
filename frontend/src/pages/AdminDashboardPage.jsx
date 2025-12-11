// src/pages/AdminDashboardPage.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import AdminView from "../views/AdminView";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const displayName = user?.name || "Admin";

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="vs-admin-page">
      <header className="vs-admin-header">
        <div className="vs-admin-logo-group">
          <div className="vs-admin-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="vs-admin-title-group">
            <h1>{t('admin.dashboard')}</h1>
            <p className="vs-admin-subtitle">VoidShop</p>
          </div>
        </div>

        <div className="vs-admin-actions">
          <div className="vs-admin-user-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginBottom: "1px" }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="vs-admin-user-name">{displayName}</span>
          </div>
          <button className="vs-secondary-btn" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            {t('admin.viewStore') || 'Ver Tienda'}
          </button>
          <button className="vs-secondary-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginBottom: "1px" }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t('header.logout')}
          </button>
        </div>
      </header>

      <AdminView />
    </div>
  );
}
