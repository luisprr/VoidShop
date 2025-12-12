// backend/paymentRoutes.js
import express from "express";
import crypto from "crypto";
import { authRequired } from "./middlewares/authMiddleware.js";
import { query } from "./database/db.js";

const router = express.Router();

// Configuración de encriptación
const ENCRYPTION_KEY_STRING = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
// Asegurar que la key sea exactamente 32 bytes
let ENCRYPTION_KEY;
try {
  // Primero intentar base64
  let decoded = Buffer.from(ENCRYPTION_KEY_STRING, 'base64');
  if (decoded.length === 32) {
    ENCRYPTION_KEY = decoded;
    console.log('✅ ENCRYPTION_KEY cargada desde base64 (32 bytes)');
  } else {
    // Intentar hex
    decoded = Buffer.from(ENCRYPTION_KEY_STRING.slice(0, 64), 'hex');
    if (decoded.length === 32) {
      ENCRYPTION_KEY = decoded;
      console.log('✅ ENCRYPTION_KEY cargada desde hex (32 bytes)');
    } else {
      // Usar string directo, tomar primeros 32 chars
      ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_STRING.slice(0, 32).padEnd(32, '0'));
      console.log('⚠️  ENCRYPTION_KEY generada desde string (32 bytes)');
    }
  }
} catch (e) {
  console.error('❌ Error al procesar ENCRYPTION_KEY:', e.message);
  ENCRYPTION_KEY = Buffer.from('12345678901234567890123456789012');
  console.log('⚠️  Usando ENCRYPTION_KEY por defecto (INSEGURO)');
}
console.log('🔐 ENCRYPTION_KEY length:', ENCRYPTION_KEY.length, 'bytes');
const ALGORITHM = "aes-256-cbc";

// Funciones de encriptación/desencriptación
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error('Error al encriptar:', error);
    throw new Error('Error al encriptar datos');
  }
}

function decrypt(text) {
  try {
    const parts = text.split(":");
    const iv = Buffer.from(parts.shift(), "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Error al desencriptar:', error);
    return '****';
  }
}

/**
 * @swagger
 * /user/payment-methods:
 *   get:
 *     summary: Obtener métodos de pago del usuario
 *     tags:
 *       - Pagos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de métodos de pago (datos enmascarados)
 */
router.get("/user/payment-methods", authRequired, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, card_number_encrypted, cardholder_name, expiry_month, expiry_year, card_type, is_default, created_at FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, id",
      [req.user.id]
    );

    // Retornar solo los últimos 4 dígitos de la tarjeta
    const mappedPayments = result.rows.map(pm => {
      let lastFour = '****';
      try {
        const decrypted = decrypt(pm.card_number_encrypted);
        lastFour = decrypted.slice(-4);
      } catch (e) {
        console.error('Error al desencriptar tarjeta:', e);
      }
      return {
        id: pm.id,
        cardholderName: pm.cardholder_name,
        last4: lastFour,
        expiry: `${String(pm.expiry_month).padStart(2, '0')}/${pm.expiry_year}`,
        expiryMonth: pm.expiry_month,
        expiryYear: pm.expiry_year,
        type: pm.card_type,
        cardType: pm.card_type,
        isDefault: pm.is_default,
        created_at: pm.created_at
      };
    });
    res.json(mappedPayments);
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    res.status(500).json({ message: "Error al obtener métodos de pago" });
  }
});

/**
 * @swagger
 * /user/payment-methods:
 *   post:
 *     summary: Agregar un nuevo método de pago (tarjeta)
 *     tags:
 *       - Pagos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardNumber:
 *                 type: string
 *               cardholderName:
 *                 type: string
 *               expiryMonth:
 *                 type: integer
 *               expiryYear:
 *                 type: integer
 *               cvv:
 *                 type: string
 *               cardType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Método de pago agregado
 */
router.post("/user/payment-methods", authRequired, async (req, res) => {
  try {
    const { cardNumber, cardholderName, expiryMonth, expiryYear, cvv, cardType } = req.body;

    // Validar que los campos numéricos sean válidos
    const month = parseInt(expiryMonth);
    const year = parseInt(expiryYear);

    if (!cardNumber || !cardholderName || !month || !year || !cvv) {
      return res.status(400).json({ message: "Faltan datos de la tarjeta" });
    }

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Fecha de expiración inválida" });
    }

    // Encriptar datos sensibles
    const cleanCardNumber = cardNumber.replace(/\s/g, ''); // Remover espacios
    const encryptedCardNumber = encrypt(cleanCardNumber);
    const encryptedCVV = encrypt(cvv);

    const result = await query(
      "INSERT INTO payment_methods (user_id, card_number_encrypted, cardholder_name, expiry_month, expiry_year, cvv_encrypted, card_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [req.user.id, encryptedCardNumber, cardholderName, month, year, encryptedCVV, cardType || "Visa"]
    );

    const pm = result.rows[0];
    res.status(201).json({
      id: pm.id,
      cardholderName: pm.cardholder_name,
      last4: cleanCardNumber.slice(-4),
      expiry: `${String(month).padStart(2, '0')}/${year}`,
      expiryMonth: pm.expiry_month,
      expiryYear: pm.expiry_year,
      type: pm.card_type,
      cardType: pm.card_type,
      isDefault: pm.is_default
    });
  } catch (error) {
    console.error("Error al agregar método de pago:", error);
    console.error("Error details:", error.message);
    res.status(500).json({ message: "Error al agregar método de pago", error: error.message });
  }
});

/**
 * @swagger
 * /user/payment-methods/{id}:
 *   delete:
 *     summary: Eliminar un método de pago
 *     tags:
 *       - Pagos
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
 *         description: Método de pago eliminado
 */
router.delete("/user/payment-methods/:id", authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await query(
      "DELETE FROM payment_methods WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Método de pago no encontrado" });
    }

    res.json({ message: "Método de pago eliminado" });
  } catch (error) {
    console.error("Error al eliminar método de pago:", error);
    res.status(500).json({ message: "Error al eliminar método de pago" });
  }
});

export default router;
