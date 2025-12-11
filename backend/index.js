// backend/index.js
// ⚠️ IMPORTANTE: Solo cargar dotenv si no estamos en Railway
// Railway inyecta variables directamente, no necesita .env
if (!process.env.RAILWAY_ENVIRONMENT) {
  const dotenv = await import("dotenv");
  dotenv.config();
}

import express from "express";
import cors from "cors";

import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js";
import couponRoutes from "./couponRoutes.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import cartRoutes from "./cartRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

// Importar conexión a PostgreSQL (después de cargar .env)
import "./database/db.js";
import { runMigrations } from "./database/migrations.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS con origenes especificos
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// ==================================================
// ✅ EJECUTAR MIGRACIONES AL INICIAR
// ==================================================
async function initializeDatabase() {
  const autoMigrate = process.env.AUTO_MIGRATE === "true";
  
  if (!autoMigrate) {
    console.log("\n⏭️  Migraciones automáticas desactivadas (AUTO_MIGRATE=false)");
    console.log("   Para activarlas, configura AUTO_MIGRATE=true en .env\n");
    return;
  }

  try {
    await runMigrations();
  } catch (error) {
    console.error("❌ Error fatal al inicializar la base de datos:", error);
    console.error("⚠️  El servidor continuará pero puede haber problemas");
  }
}

// Ejecutar migraciones antes de levantar el servidor
await initializeDatabase();

// ==================================================
// ✅ RUTAS DE LA API
// ==================================================
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", couponRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", paymentRoutes);
app.use("/api", cartRoutes);
app.use("/api", favoriteRoutes);

// Endpoint simple de salud
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "VoidShop API" });
});

// ==================================================
// ✅ SWAGGER UI
// ==================================================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`🚀 VoidShop backend escuchando en http://localhost:${PORT}`);
  console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
});
