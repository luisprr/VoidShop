// frontend/src/components/AuthErrorHandler.jsx
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthErrorHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Listener global para errores de fetch
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Si obtenemos un 401 (no autorizado), cerrar sesión
      if (response.status === 401) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          const message = data?.message || "";
          
          if (message.toLowerCase().includes("token") || 
              message.toLowerCase().includes("autenticación") ||
              message.toLowerCase().includes("authentication") ||
              message.toLowerCase().includes("expired") ||
              message.toLowerCase().includes("invalid")) {
            
            console.warn("Token inválido detectado. Cerrando sesión...");
            logout();
            
            // Pequeño delay para que el logout se ejecute
            setTimeout(() => {
              navigate("/login", { replace: true });
            }, 100);
          }
        } catch (e) {
          // Si no se puede parsear la respuesta, ignorar
        }
      }
      
      return response;
    };

    // Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, [logout, navigate]);

  return null; // Este componente no renderiza nada
}
