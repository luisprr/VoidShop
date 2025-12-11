// backend/cartRoutes.js
import express from "express";
import { pool } from "./database/db.js";
import { authRequired } from "./middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del producto
 *         name:
 *           type: string
 *           description: Nombre del producto
 *         price:
 *           type: number
 *           description: Precio del producto
 *         quantity:
 *           type: integer
 *           description: Cantidad en el carrito
 *         stock:
 *           type: integer
 *           description: Stock disponible
 *         image_url:
 *           type: string
 *           description: URL de la imagen
 *         category:
 *           type: string
 *           description: Categoria del producto
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Obtener el carrito del usuario autenticado
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de items en el carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get("/cart", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        ci.id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.stock,
        p.image_url,
        p.category
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC`,
      [userId]
    );

    const cartItems = result.rows.map(row => ({
      id: row.product_id,
      name: row.name,
      price: parseFloat(row.price),
      quantity: row.quantity,
      stock: row.stock,
      image_url: row.image_url,
      category: row.category
    }));

    res.json(cartItems);
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Agregar o actualizar un producto en el carrito
 *     tags:
 *       - Carrito
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
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Producto agregado al carrito
 *       400:
 *         description: Datos invalidos o stock insuficiente
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post("/cart", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }

    // Verificar que el producto existe y tiene stock
    const productResult = await pool.query(
      "SELECT id, stock FROM products WHERE id = $1",
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const product = productResult.rows[0];
    if (quantity > product.stock) {
      return res.status(400).json({ 
        message: "Cantidad excede el stock disponible",
        stock: product.stock 
      });
    }

    // Insertar o actualizar en el carrito
    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, productId, quantity]
    );

    res.json({ 
      message: "Producto agregado al carrito",
      cartItem: result.rows[0]
    });
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    res.status(500).json({ message: "Error al agregar al carrito" });
  }
});

/**
 * @swagger
 * /cart/{productId}:
 *   put:
 *     summary: Actualizar la cantidad de un producto en el carrito
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 *       400:
 *         description: Cantidad invalida o stock insuficiente
 *       404:
 *         description: Producto no encontrado en el carrito
 *       500:
 *         description: Error del servidor
 */
router.put("/cart/:productId", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: "Falta la cantidad" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }

    // Verificar stock disponible
    const productResult = await pool.query(
      "SELECT stock FROM products WHERE id = $1",
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (quantity > productResult.rows[0].stock) {
      return res.status(400).json({ 
        message: "Cantidad excede el stock disponible",
        stock: productResult.rows[0].stock
      });
    }

    const result = await pool.query(
      `UPDATE cart_items 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2 AND product_id = $3
       RETURNING *`,
      [quantity, userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito" });
    }

    res.json({ 
      message: "Cantidad actualizada",
      cartItem: result.rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    res.status(500).json({ message: "Error al actualizar cantidad" });
  }
});

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Eliminar un producto del carrito
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 *       500:
 *         description: Error del servidor
 */
router.delete("/cart/:productId", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await pool.query(
      "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *",
      [userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito" });
    }

    res.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    res.status(500).json({ message: "Error al eliminar del carrito" });
  }
});

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Vaciar todo el carrito del usuario
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.delete("/cart", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      "DELETE FROM cart_items WHERE user_id = $1",
      [userId]
    );

    res.json({ message: "Carrito vaciado correctamente" });
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    res.status(500).json({ message: "Error al vaciar el carrito" });
  }
});

export default router;
