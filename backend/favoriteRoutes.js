// backend/favoriteRoutes.js
import express from "express";
import { pool } from "./database/db.js";
import { authRequired } from "./middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del producto
 *         name:
 *           type: string
 *           description: Nombre del producto
 *         description:
 *           type: string
 *           description: Descripcion del producto
 *         price:
 *           type: number
 *           description: Precio del producto
 *         stock:
 *           type: integer
 *           description: Stock disponible
 *         category:
 *           type: string
 *           description: Categoria del producto
 *         image_url:
 *           type: string
 *           description: URL de la imagen
 *         favorited_at:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se agrego a favoritos
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Obtener lista completa de favoritos del usuario
 *     tags:
 *       - Favoritos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos favoritos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get("/favorites", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        f.id as favorite_id,
        f.product_id,
        f.created_at,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.category,
        p.image_url
      FROM favorites f
      INNER JOIN products p ON f.product_id = p.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC`,
      [userId]
    );

    const favorites = result.rows.map(row => ({
      id: row.product_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock: row.stock,
      category: row.category,
      image_url: row.image_url,
      favorited_at: row.created_at
    }));

    res.json(favorites);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ message: "Error al obtener favoritos" });
  }
});

/**
 * @swagger
 * /favorites/ids:
 *   get:
 *     summary: Obtener solo los IDs de productos favoritos (chequeo rapido)
 *     tags:
 *       - Favoritos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array de IDs de productos favoritos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *               example: [1, 5, 12]
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get("/favorites/ids", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT product_id FROM favorites WHERE user_id = $1",
      [userId]
    );

    const favoriteIds = result.rows.map(row => row.product_id);

    res.json(favoriteIds);
  } catch (error) {
    console.error("Error al obtener IDs de favoritos:", error);
    res.status(500).json({ message: "Error al obtener favoritos" });
  }
});

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Agregar un producto a favoritos
 *     tags:
 *       - Favoritos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Producto agregado a favoritos
 *       400:
 *         description: Falta el ID del producto
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: Producto ya esta en favoritos
 *       500:
 *         description: Error del servidor
 */
router.post("/favorites", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Falta el ID del producto" });
    }

    // Verificar que el producto existe
    const productResult = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Insertar en favoritos (ignorar si ya existe)
    const result = await pool.query(
      `INSERT INTO favorites (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "El producto ya está en favoritos" });
    }

    res.status(201).json({ 
      message: "Producto agregado a favoritos",
      favorite: result.rows[0]
    });
  } catch (error) {
    console.error("Error al agregar a favoritos:", error);
    res.status(500).json({ message: "Error al agregar a favoritos" });
  }
});

/**
 * @swagger
 * /favorites/{productId}:
 *   delete:
 *     summary: Eliminar un producto de favoritos
 *     tags:
 *       - Favoritos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar de favoritos
 *     responses:
 *       200:
 *         description: Producto eliminado de favoritos
 *       500:
 *         description: Error del servidor
 */
router.delete("/favorites/:productId", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND product_id = $2 RETURNING *",
      [userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado en favoritos" });
    }

    res.json({ message: "Producto eliminado de favoritos" });
  } catch (error) {
    console.error("Error al eliminar de favoritos:", error);
    res.status(500).json({ message: "Error al eliminar de favoritos" });
  }
});

/**
 * @swagger
 * /favorites/toggle:
 *   post:
 *     summary: Alternar un producto en favoritos (agregar/eliminar)
 *     description: Si el producto esta en favoritos lo elimina, si no esta lo agrega
 *     tags:
 *       - Favoritos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Favorito alternado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFavorite:
 *                   type: boolean
 *                   description: true si se agrego, false si se elimino
 *       400:
 *         description: Falta el ID del producto
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post("/favorites/toggle", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Falta el ID del producto" });
    }

    // Verificar si ya existe
    const existingResult = await pool.query(
      "SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (existingResult.rows.length > 0) {
      // Ya existe, eliminarlo
      await pool.query(
        "DELETE FROM favorites WHERE user_id = $1 AND product_id = $2",
        [userId, productId]
      );
      return res.json({ 
        message: "Producto eliminado de favoritos",
        action: "removed"
      });
    } else {
      // No existe, agregarlo
      const result = await pool.query(
        "INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *",
        [userId, productId]
      );
      return res.json({ 
        message: "Producto agregado a favoritos",
        action: "added",
        favorite: result.rows[0]
      });
    }
  } catch (error) {
    console.error("Error al alternar favorito:", error);
    res.status(500).json({ message: "Error al alternar favorito" });
  }
});

export default router;
