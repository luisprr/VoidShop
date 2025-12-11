// backend/productRoutes.js
import express from "express";
import { query } from "./database/db.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del producto
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre del producto
 *           example: "Vestido rojo seda"
 *         category:
 *           type: string
 *           description: Categoría del producto
 *           enum: [Hombre, Mujer, Unisex, Accesorio, Juguete, Aparatos Electrónicos, Calzado]
 *           example: "Mujer"
 *         price:
 *           type: number
 *           format: float
 *           description: Precio del producto en soles
 *           example: 350.00
 *         stock:
 *           type: integer
 *           description: Cantidad disponible en inventario
 *           example: 5
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           description: URL de la imagen del producto
 *           example: "https://example.com/image.jpg"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Descripción detallada del producto
 *           example: "Elegante vestido de seda en color rojo vibrante"
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar todos los productos
 *     tags:
 *       - Productos
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/products", async (req, res) => {
  try {
    const result = await query("SELECT * FROM products ORDER BY id");
    // Transformar snake_case a camelCase
    const products = result.rows.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      imageUrl: p.image_url,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags:
 *       - Productos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Datos incompletos
 */
router.post("/products", async (req, res) => {
  try {
    const { name, category, price, stock, imageUrl, description } = req.body;

    if (!name || !category || price == null || stock == null) {
      return res
        .status(400)
        .json({ message: "Faltan campos: name, category, price, stock" });
    }

    const result = await query(
      "INSERT INTO products (name, description, price, stock, category, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description || null, Number(price), Number(stock), category, imageUrl || null]
    );

    const product = result.rows[0];
    res.status(201).json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: "Error al crear producto" });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del producto
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *   delete:
 *     summary: Eliminar un producto por ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del producto
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 */
router.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await query("SELECT * FROM products WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const p = result.rows[0];
    res.json({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      imageUrl: p.image_url,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ message: "Error al obtener producto" });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar un producto por ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del producto a actualizar
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos incompletos o inválidos
 *       404:
 *         description: Producto no encontrado
 */
router.put("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, category, price, stock, imageUrl, description } = req.body;

    if (!name || !category || price == null || stock == null) {
      return res
        .status(400)
        .json({ message: "Faltan campos: name, category, price, stock" });
    }

    const result = await query(
      "UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [name, description || null, Number(price), Number(stock), category, imageUrl || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const p = result.rows[0];
    res.json({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      imageUrl: p.image_url,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
});

export default router;
