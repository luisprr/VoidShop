// backend/couponRoutes.js
import express from "express";
import { query } from "./database/db.js";
import { authRequired, adminOnly } from "./middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         discount:
 *           type: number
 *           description: Valor entre 0 y 1 (ej. 0.25 = 25%)
 */

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Listar cupones disponibles
 *     tags:
 *       - Cupones
 *     responses:
 *       200:
 *         description: Lista de cupones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coupon'
 */
router.get("/coupons", async (req, res) => {
  try {
    const result = await query("SELECT * FROM coupons WHERE is_active = true ORDER BY code");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener cupones:", error);
    res.status(500).json({ message: "Error al obtener cupones" });
  }
});

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validar un cupón y calcular el total con descuento
 *     tags:
 *       - Cupones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               cartTotal:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cupón válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 discountPercent:
 *                   type: number
 *                 originalTotal:
 *                   type: number
 *                 discountedTotal:
 *                   type: number
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cupón no válido
 */
router.post("/coupons/validate", async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || typeof cartTotal !== "number") {
      return res
        .status(400)
        .json({ message: "Se requiere code y cartTotal numérico" });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const result = await query(
      "SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true",
      [cleanCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cupón no válido" });
    }

    const coupon = result.rows[0];

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = cartTotal * (Number(coupon.discount_value) / 100);
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    const discountedTotal = Number((cartTotal - discountAmount).toFixed(2));

    res.json({
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      discountPercent: Number(coupon.discount_value) / 100,
      originalTotal: cartTotal,
      discountAmount: Number(discountAmount.toFixed(2)),
      discountedTotal: Math.max(0, discountedTotal),
    });
  } catch (error) {
    console.error("Error al validar cupón:", error);
    res.status(500).json({ message: "Error al validar cupón" });
  }
});

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Crear un nuevo cupón (solo admin)
 *     tags:
 *       - Cupones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *                 description: Valor entre 0 y 1 (ej. 0.25 = 25%)
 *     responses:
 *       201:
 *         description: Cupón creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Código repetido
 */
router.post("/coupons", authRequired, adminOnly, async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, maxUses, expiryDate } = req.body;

    const cleanCode = typeof code === "string" ? code.trim().toUpperCase() : "";

    if (!cleanCode) {
      return res.status(400).json({ message: "El código del cupón es obligatorio" });
    }

    if (!discountType || !['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ message: "Tipo de descuento inválido (percentage o fixed)" });
    }

    const d = Number(discountValue);
    if (!Number.isFinite(d) || d <= 0) {
      return res.status(400).json({ message: "El valor de descuento debe ser mayor a 0" });
    }

    // Verificar si existe
    const exists = await query("SELECT id FROM coupons WHERE UPPER(code) = $1", [cleanCode]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: "Ya existe un cupón con ese código" });
    }

    const result = await query(
      "INSERT INTO coupons (code, discount_type, discount_value, min_purchase, max_uses, expiry_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [cleanCode, discountType, d, minPurchase || 0, maxUses || null, expiryDate || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear cupón:", error);
    res.status(500).json({ message: "Error al crear cupón" });
  }
});

/**
 * @swagger
 * /coupons/{code}:
 *   delete:
 *     summary: Eliminar un cupón por código (solo admin)
 *     tags:
 *       - Cupones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código del cupón a eliminar
 *     responses:
 *       200:
 *         description: Cupón eliminado
 *       404:
 *         description: Cupón no encontrado
 */
router.delete("/coupons/:code", authRequired, adminOnly, async (req, res) => {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();

    const result = await query(
      "DELETE FROM coupons WHERE UPPER(code) = $1 RETURNING *",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    res.json({
      message: "Cupón eliminado",
      coupon: result.rows[0],
    });
  } catch (error) {
    console.error("Error al eliminar cupón:", error);
    res.status(500).json({ message: "Error al eliminar cupón" });
  }
});

export default router;
