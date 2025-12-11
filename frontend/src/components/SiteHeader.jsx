import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import logo from "../VoidShopLogo.png";

export default function SiteHeader() {
  const { user, logout, isAdmin } = useAuth();
  const { cartItems = [], favorites = [] } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { t, i18n } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Obtener query de URL si existe
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  }

  function changeLanguage(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setShowLangMenu(false);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMobileMenu();
  }

  // Cerrar menú al hacer clic en el overlay
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Overlay para cerrar el menú */}
      {mobileMenuOpen && (
        <div className="vs-mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      <header className="vs-header">

        {/* LOGO */}
        <div className="vs-header-left">
          <Link to="/" className="vs-logo" onClick={closeMobileMenu}>
            <img src={logo} alt="VoidShop" className="vs-logo-img" />
            <span className="vs-logo-text">VOIDSHOP</span>
          </Link>
        </div>

        {/* HAMBURGER MENU (Mobile) */}
        <button 
          className={`vs-hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      {/* BUSCADOR */}
      <div className="vs-header-center">
        <form className="vs-search" onSubmit={handleSearch}>
          <input
            className="vs-search-input"
            placeholder={t('header.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="vs-search-btn">
            <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
              <path d="M508.5 481.6l-129-129c-2.3-2.3-5.3-3.5-8.5-3.5h-10.3C395 312 416 262.5 416 208 416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c54.5 0 104-21 141.1-55.2V371c0 3.2 1.3 6.2 3.5 8.5l129 129c4.7 4.7 12.3 4.7 17 0l9.9-9.9c4.7-4.7 4.7-12.3 0-17zM208 384c-97.3 0-176-78.7-176-176S110.7 32 208 32s176 78.7 176 176-78.7 176-176 176z"/>
            </svg>
          </button>
        </form>
      </div>

      {/* DERECHA */}
      <div className={`vs-header-right ${mobileMenuOpen ? 'vs-mobile-menu-open' : ''}`}>

        {/* Selector de Idioma */}
        <div className="vs-lang-selector">
          <button 
            className="vs-lang-btn" 
            onClick={() => setShowLangMenu(!showLangMenu)}
            aria-label="Change language"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
            </svg>
            <span className="vs-lang-text">{i18n.language.toUpperCase()}</span>
          </button>
          {showLangMenu && (
            <div className="vs-lang-menu">
              <button 
                className={`vs-lang-option ${i18n.language === 'es' ? 'active' : ''}`}
                onClick={() => changeLanguage('es')}
              >
                Español
              </button>
              <button 
                className={`vs-lang-option ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                English
              </button>
            </div>
          )}
        </div>

        {/* Usuario */}
        {user ? (
          <Link to="/profile" className="vs-header-user" style={{ textDecoration: "none" }} onClick={closeMobileMenu}>
            <div className="vs-header-user-icon">
              <svg width="16" height="16" fill="currentColor">
                <circle cx="8" cy="6" r="3"/>
                <path d="M2 14c1.5-4 10.5-4 12 0"/>
              </svg>
            </div>
            <span className="vs-header-user-name">
              {user.name}
            </span>
          </Link>
        ) : (
          <div className="vs-header-user">
            <div className="vs-header-user-icon">
              <svg width="16" height="16" fill="currentColor">
                <circle cx="8" cy="6" r="3"/>
                <path d="M2 14c1.5-4 10.5-4 12 0"/>
              </svg>
            </div>
            <span className="vs-header-user-name">
              {t('header.guest')}
            </span>
          </div>
        )}

        {/* FAVORITOS */}
        <Link to="/favorites" className="vs-icon-btn" onClick={closeMobileMenu}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
          </svg>
          <span className="vs-icon-badge">{favorites.length}</span>
        </Link>

        {/* CARRITO */}
        <Link to="/cart" className="vs-icon-btn" onClick={closeMobileMenu}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h15l-1.5 9h-12z"/>
            <circle cx="9" cy="20" r="1.5"/>
            <circle cx="18" cy="20" r="1.5"/>
          </svg>
          <span className="vs-icon-badge">{cartItems.length}</span>
        </Link>

        {/* LOGIN / LOGOUT */}
        {!user ? (
          <>
            <Link className="vs-header-link" to="/login" onClick={closeMobileMenu}>{t('header.login')}</Link>
            <Link className="vs-header-link vs-header-link--ghost" to="/register" onClick={closeMobileMenu}>{t('header.register')}</Link>
            <Link className="vs-header-link vs-header-link--outline" to="/admin/login" onClick={closeMobileMenu}>
              {t('header.adminQuestion')}
            </Link>
          </>
        ) : (
          <>
            {isAdmin && (
              <Link className="vs-header-link vs-header-link--outline" to="/admin" onClick={closeMobileMenu}>
                {t('header.adminPanel')}
              </Link>
            )}
            <button className="vs-header-link" onClick={handleLogout}>
              {t('header.logout')}
            </button>
          </>
        )}

      </div>
      </header>
    </>
  );
}
