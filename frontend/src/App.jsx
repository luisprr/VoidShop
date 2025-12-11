// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";

import CatalogPage from "./pages/CatalogPage";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AuthErrorHandler from "./components/AuthErrorHandler";

export default function App() {
  return (
    <Layout>
      <AuthErrorHandler />
      <Routes>
        {/* Catálogo (home) */}
        <Route path="/" element={<CatalogPage />} />
        {/* También disponible en /catalog para que no rompa los enlaces antiguos */}
        <Route path="/catalog" element={<CatalogPage />} />

        {/* Detalle de producto, carrito y auth */}
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />

        {/* Cualquier otra ruta -> catálogo */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
