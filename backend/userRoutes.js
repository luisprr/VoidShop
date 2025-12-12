// backend/userRoutes.js
import express from "express";
import { authRequired } from "./middlewares/authMiddleware.js";
import { query } from "./database/db.js";

const router = express.Router();

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Obtener el perfil del usuario actual
 *     tags:
 *       - Usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 */
router.get("/user/profile", authRequired, async (req, res) => {
  try {
    const result = await query("SELECT id, username, email, role, created_at FROM users WHERE id = $1", [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
});

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Actualizar el perfil del usuario actual
 *     tags:
 *       - Usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.put("/user/profile", authRequired, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Verificar si el email ya está en uso por otro usuario
    if (email) {
      const emailCheck = await query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, req.user.id]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: "El email ya está en uso" });
      }
    }

    const result = await query(
      "UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email) WHERE id = $3 RETURNING id, username, email, role, created_at",
      [name, email, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
});

/**
 * @swagger
 * /user/addresses:
 *   get:
 *     summary: Obtener direcciones del usuario actual
 *     tags:
 *       - Usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de direcciones
 */
router.get("/user/addresses", authRequired, async (req, res) => {
  try {
    const result = await query("SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id", [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    res.status(500).json({ message: "Error al obtener direcciones" });
  }
});

/**
 * @swagger
 * /user/addresses:
 *   post:
 *     summary: Agregar una nueva dirección
 *     tags:
 *       - Usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dirección creada
 */
router.post("/user/addresses", authRequired, async (req, res) => {
  try {
    // Aceptar tanto nombres del frontend como del backend
    const street = req.body.street || req.body.address;
    const city = req.body.city;
    const state = req.body.state || req.body.address2 || '';
    const zipCode = req.body.zipCode || req.body.postalCode;
    const country = req.body.country || "Perú";

    if (!street || !city || !zipCode) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const result = await query(
      "INSERT INTO addresses (user_id, street, city, state, zip_code, country) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [req.user.id, street, city, state, zipCode, country]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear dirección:", error);
    res.status(500).json({ message: "Error al crear dirección" });
  }
});

/**
 * @swagger
 * /user/addresses/{id}:
 *   put:
 *     summary: Actualizar una dirección
 *     tags:
 *       - Usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Dirección actualizada
 */
router.put("/user/addresses/:id", authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    // Aceptar tanto nombres del frontend como del backend
    const street = req.body.street || req.body.address;
    const city = req.body.city;
    const state = req.body.state || req.body.address2;
    const zipCode = req.body.zipCode || req.body.postalCode;
    const country = req.body.country;

    const result = await query(
      "UPDATE addresses SET street = COALESCE($1, street), city = COALESCE($2, city), state = COALESCE($3, state), zip_code = COALESCE($4, zip_code), country = COALESCE($5, country) WHERE id = $6 AND user_id = $7 RETURNING *",
      [street, city, state, zipCode, country, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Dirección no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    res.status(500).json({ message: "Error al actualizar dirección" });
  }
});

/**
 * @swagger
 * /user/addresses/{id}:
 *   delete:
 *     summary: Eliminar una dirección
 *     tags:
 *       - Usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dirección eliminada
 */
router.delete("/user/addresses/:id", authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await query(
      "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Dirección no encontrada" });
    }

    res.json({ message: "Dirección eliminada" });
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    res.status(500).json({ message: "Error al eliminar dirección" });
  }
});

export default router;
