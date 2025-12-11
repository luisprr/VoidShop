// backend/orderRoutes.js
import express from "express";
import { query, transaction } from "./database/db.js";
import { authRequired, adminOnly } from "./middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             type: object
 *         total:
 *           type: number
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 */

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Obtener las órdenes del usuario actual
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes del usuario
 */
router.get("/orders/my", authRequired, async (req, res) => {
  try {
    // Usuario solo ve sus órdenes
    const result = await query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );

    // Para cada orden, obtener sus items con información del producto
    for (let order of result.rows) {
      const items = await query(`
        SELECT oi.*, p.name as product_name, p.image_url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [order.id]);
      
      order.items = items.rows.map(item => ({
        id: item.id,
        productId: item.product_id,
        name: item.product_name || item.name,
        price: item.product_price || item.price,
        quantity: item.quantity,
        imageUrl: item.product_image || item.image_url
      }));
      
      // Parsear JSONs si existen
      if (order.shipping_address_json) {
        try {
          order.shippingAddress = JSON.parse(order.shipping_address_json);
        } catch (e) {}
      }
      if (order.payment_method_json) {
        try {
          order.paymentMethod = JSON.parse(order.payment_method_json);
        } catch (e) {}
      }
      
      // Normalizar campos para camelCase
      order.userId = order.user_id;
      order.couponCode = order.coupon_code;
      order.createdAt = order.created_at;
      order.updatedAt = order.updated_at;
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes del usuario:", error);
    res.status(500).json({ message: "Error al obtener órdenes", error: error.message });
  }
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Obtener todas las órdenes (admin) o del usuario actual
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes
 */
router.get("/orders", authRequired, async (req, res) => {
  try {
    let result;
    
    if (req.user.role === "admin") {
      // Admin ve todas las órdenes con información del usuario
      result = await query(`
        SELECT o.*, u.email as user_email, u.username as user_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);
      
      // Para cada orden, obtener sus items con información del producto
      for (let order of result.rows) {
        const items = await query(`
          SELECT oi.*, p.name as product_name, p.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);
        
        order.items = items.rows.map(item => ({
          id: item.id,
          productId: item.product_id,
          name: item.product_name || item.name,
          price: item.product_price || item.price,
          quantity: item.quantity,
          imageUrl: item.product_image || item.image_url
        }));
        
        // Parsear JSONs si existen
        if (order.shipping_address_json) {
          try {
            order.shippingAddress = JSON.parse(order.shipping_address_json);
          } catch (e) {}
        }
        if (order.payment_method_json) {
          try {
            order.paymentMethod = JSON.parse(order.payment_method_json);
          } catch (e) {}
        }
        
        // Normalizar campos
        order.userId = order.user_id;
        order.couponCode = order.coupon_code;
        order.createdAt = order.created_at;
        order.updatedAt = order.updated_at;
        order.user = {
          name: order.user_name,
          email: order.user_email
        };
      }
    } else {
      // Usuario normal solo ve sus órdenes
      result = await query(
        "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
        [req.user.id]
      );
      
      // Para cada orden, obtener sus items
      for (let order of result.rows) {
        const items = await query(`
          SELECT oi.*, p.name as product_name, p.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);
        
        order.items = items.rows.map(item => ({
          id: item.id,
          productId: item.product_id,
          name: item.product_name || item.name,
          price: item.product_price || item.price,
          quantity: item.quantity,
          imageUrl: item.product_image || item.image_url
        }));
        
        // Parsear JSONs si existen
        if (order.shipping_address_json) {
          try {
            order.shippingAddress = JSON.parse(order.shipping_address_json);
          } catch (e) {}
        }
        if (order.payment_method_json) {
          try {
            order.paymentMethod = JSON.parse(order.payment_method_json);
          } catch (e) {}
        }
        
        // Normalizar campos
        order.userId = order.user_id;
        order.couponCode = order.coupon_code;
        order.createdAt = order.created_at;
        order.updatedAt = order.updated_at;
      }
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error al obtener órdenes", error: error.message });
  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear una nueva orden
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: object
 *     responses:
 *       201:
 *         description: Orden creada
 */
router.post("/orders", authRequired, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Faltan items de la orden" });
    }

    // Usar transacción para asegurar consistencia
    const order = await transaction(async (client) => {
      let total = 0;
      const orderItems = [];

      // Validar y calcular total
      for (const item of items) {
        const productResult = await client.query(
          "SELECT * FROM products WHERE id = $1",
          [item.productId]
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Producto ${item.productId} no encontrado`);
        }

        const product = productResult.rows[0];

        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }

        const subtotal = Number(product.price) * item.quantity;
        total += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          subtotal,
        });

        // Descontar stock
        await client.query(
          "UPDATE products SET stock = stock - $1 WHERE id = $2",
          [item.quantity, product.id]
        );
      }

      // Crear orden
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total, status, shipping_address_json, payment_method_json) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          req.user.id,
          total.toFixed(2),
          "pending",
          JSON.stringify(shippingAddress || {}),
          JSON.stringify(paymentMethod || {}),
        ]
      );

      const newOrder = orderResult.rows[0];

      // Crear order_items
      for (const item of orderItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newOrder.id, item.productId, item.productName, item.productPrice, item.quantity, item.subtotal]
        );
      }

      // Obtener items para retornar
      const itemsResult = await client.query(
        "SELECT * FROM order_items WHERE order_id = $1",
        [newOrder.id]
      );

      newOrder.items = itemsResult.rows;
      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ message: error.message || "Error al crear orden" });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtener una orden por ID
 *     tags:
 *       - Órdenes
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
 *         description: Orden encontrada
 */
router.get("/orders/:id", authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    let result;
    if (req.user.role === "admin") {
      result = await query("SELECT * FROM orders WHERE id = $1", [id]);
    } else {
      result = await query(
        "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
        [id, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const order = result.rows[0];

    // Obtener items
    const items = await query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [order.id]
    );
    order.items = items.rows;

    // Parsear JSONs
    if (order.shipping_address_json) {
      try {
        order.shippingAddress = JSON.parse(order.shipping_address_json);
      } catch (e) {}
    }
    if (order.payment_method_json) {
      try {
        order.paymentMethod = JSON.parse(order.payment_method_json);
      } catch (e) {}
    }

    res.json(order);
  } catch (error) {
    console.error("Error al obtener orden:", error);
    res.status(500).json({ message: "Error al obtener orden" });
  }
});

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Actualizar el estado de una orden (solo admin)
 *     tags:
 *       - Órdenes
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.put("/orders/:id/status", authRequired, adminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const result = await query(
      "UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

/**
 * @swagger
 * /orders/stats:
 *   get:
 *     summary: Obtener estadísticas de ventas (solo admin)
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de ventas
 */
router.get("/orders/stats", authRequired, adminOnly, async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as average_order_value
      FROM orders
    `);

    const productsSold = await query(`
      SELECT COALESCE(SUM(quantity), 0) as total_products_sold
      FROM order_items
    `);

    const recentOrders = await query(`
      SELECT o.*, u.email as user_email, u.username as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    res.json({
      totalOrders: Number(stats.rows[0].total_orders),
      totalRevenue: Number(Number(stats.rows[0].total_revenue).toFixed(2)),
      averageOrderValue: Number(Number(stats.rows[0].average_order_value).toFixed(2)),
      totalProductsSold: Number(productsSold.rows[0].total_products_sold),
      recentOrders: recentOrders.rows,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

export default router;
