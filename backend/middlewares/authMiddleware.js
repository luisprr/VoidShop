// backend/middlewares/authMiddleware.js
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Cargar variables de entorno (.env)
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto_voidshop";

/**
 * Middleware para requerir que el request tenga un JWT válido.
 * Espera header: Authorization: Bearer <token>
 */
export function authRequired(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Formato de token inválido" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload: { id, email, role, name }
    req.user = payload;
    next();
  } catch (err) {
    console.error("Error verificando token:", err.message);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

/**
 * Middleware para rutas solo de administradores.
 * Requiere que authRequired se haya ejecutado antes.
 */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso solo para administradores" });
  }
  next();
}
