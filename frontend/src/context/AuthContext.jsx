// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { apiLogin, apiRegister } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("vs_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("vs_token") || null;
  });

  const [loading, setLoading] = useState(false);

  // sincronizar user con localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("vs_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("vs_user");
    }
  }, [user]);

  // sincronizar token con localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("vs_token", token);
    } else {
      localStorage.removeItem("vs_token");
    }
  }, [token]);

  // Verificar validez del token al cargar - DESACTIVADO porque el endpoint no existe
  // useEffect(() => {
  //   if (user && token) {
  //     verifyToken();
  //   }
  // }, []);

  // async function verifyToken() {
  //   try {
  //     const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  //     const res = await fetch(`${API_URL}/auth/verify`, {
  //       method: "GET",
  //       headers: {
  //         "Authorization": `Bearer ${token}`
  //       }
  //     });

  //     if (!res.ok) {
  //       // Token inválido, cerrar sesión
  //       console.warn("Token inválido detectado, cerrando sesión...");
  //       logout();
  //     }
  //   } catch (error) {
  //     // Si hay error de red o el endpoint no existe, no hacer nada
  //     // Esto evita cerrar sesión por problemas temporales de red
  //     console.log("No se pudo verificar el token (esto es normal si el backend no tiene endpoint /auth/verify)");
  //   }
  // }

  async function register({ name, email, password }) {
    setLoading(true);
    try {
      const { user, token } = await apiRegister({ name, email, password });
      setUser(user);
      setToken(token);
      return { user, token };
    } finally {
      setLoading(false);
    }
  }

  async function login({ email, password }) {
    setLoading(true);
    try {
      const { user, token } = await apiLogin({ email, password });
      setUser(user);
      setToken(token);
      return { user, token };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  function updateUser(updatedData) {
    setUser(prev => ({ ...prev, ...updatedData }));
  }

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
