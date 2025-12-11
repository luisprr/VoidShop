// frontend/src/components/ProtectedAdminRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Si no está logeado => al login de admin
  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Si está logeado pero no es admin => de vuelta al catálogo
  if (!isAdmin) {
    return (
      <Navigate
        to="/catalog"
        replace
        state={{ error: "no-admin" }}
      />
    );
  }

  // Es admin => puede ver el contenido
  return children;
}
