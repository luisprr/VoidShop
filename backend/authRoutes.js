// backend/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./database/db.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto_voidshop";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@voidshop.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  try {
    const result = await query("SELECT id FROM users WHERE email = $1", [adminEmail]);
    
    if (result.rows.length === 0) {
      const hash = bcrypt.hashSync(adminPassword, 10);
      await query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)",
        ["admin", adminEmail, hash, "admin"]
      );
      console.log("👑 Admin creado en PostgreSQL:", adminEmail);
    }
  } catch (error) {
    console.error("Error al crear admin:", error.message);
  }
}
seedAdmin();

function signToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthRegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: "Luis"
 *         email:
 *           type: string
 *           example: "luis@example.com"
 *         password:
 *           type: string
 *           example: "123456"
 *     AuthLoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "luis@example.com"
 *         password:
 *           type: string
 *           example: "123456"
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo cliente
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterInput'
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email ya registrado
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nombre, correo y contraseña son obligatorios" });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    
    const result = await query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at",
      [name, email, passwordHash, "customer"]
    );

    const user = result.rows[0];
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.username,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Error register:", err);
    res.status(500).json({ message: "Error en el registro" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Correo y contraseña son obligatorios" });
    }

    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = result.rows[0];
    
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.username,
    });

    return res.json({
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Error login:", err);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

export default router;
