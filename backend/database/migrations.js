// backend/database/migrations.js
import { pool, query, tableExists } from "./db.js";

/**
 * Ejecuta todas las migraciones necesarias para configurar la base de datos
 */
export async function runMigrations() {
  console.log("\n🔄 Ejecutando migraciones de base de datos...");

  try {
    // 1. Crear tabla users
    await createUsersTable();
    
    // 2. Crear tabla products
    await createProductsTable();
    
    // 3. Crear tabla addresses
    await createAddressesTable();
    
    // 4. Crear tabla payment_methods
    await createPaymentMethodsTable();
    
    // 5. Crear tabla orders
    await createOrdersTable();
    
    // 6. Crear tabla order_items
    await createOrderItemsTable();
    
    // 7. Crear tabla coupons
    await createCouponsTable();
    
    // 8. Crear tabla cart_items
    await createCartItemsTable();
    
    // 9. Crear tabla favorites
    await createFavoritesTable();
    
    // 10. Crear función para updated_at
    await createUpdatedAtFunction();
    
    // 11. Crear triggers
    await createTriggers();
    
    // 12. Crear índices
    await createIndexes();
    
    // 13. Insertar datos iniciales (seed)
    await seedInitialData();
    
    console.log("✅ Migraciones completadas exitosamente\n");
  } catch (error) {
    console.error("❌ Error al ejecutar migraciones:", error);
    throw error;
  }
}

async function createUsersTable() {
  const exists = await tableExists("users");
  if (exists) {
    console.log("  ⏭️  Tabla 'users' ya existe");
    return;
  }

  await query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("  ✅ Tabla 'users' creada");
}

async function createProductsTable() {
  const exists = await tableExists("products");
  if (exists) {
    console.log("  ⏭️  Tabla 'products' ya existe");
    return;
  }

  await query(`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category VARCHAR(100) NOT NULL,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("  ✅ Tabla 'products' creada");
}

async function createAddressesTable() {
  const exists = await tableExists("addresses");
  if (exists) {
    console.log("  ⏭️  Tabla 'addresses' ya existe");
    return;
  }

  await query(`
    CREATE TABLE addresses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      street VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      zip_code VARCHAR(20) NOT NULL,
      country VARCHAR(100) NOT NULL DEFAULT 'México',
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("  ✅ Tabla 'addresses' creada");
}

async function createPaymentMethodsTable() {
  const exists = await tableExists("payment_methods");
  if (exists) {
    console.log("  ⏭️  Tabla 'payment_methods' ya existe");
    return;
  }

  await query(`
    CREATE TABLE payment_methods (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      card_number_encrypted TEXT NOT NULL,
      cardholder_name VARCHAR(255) NOT NULL,
      expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
      expiry_year INTEGER NOT NULL,
      cvv_encrypted TEXT NOT NULL,
      card_type VARCHAR(50),
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("  ✅ Tabla 'payment_methods' creada");
}

async function createOrdersTable() {
  const exists = await tableExists("orders");
  if (exists) {
    console.log("  ⏭️  Tabla 'orders' ya existe");
    return;
  }

  await query(`
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
      address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
      payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
      shipping_address_json TEXT,
      payment_method_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("  ✅ Tabla 'orders' creada");
}

async function createOrderItemsTable() {
  const exists = await tableExists("order_items");
  if (exists) {
    console.log("  ⏭️  Tabla 'order_items' ya existe");
    return;
  }

  await query(`
    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(255) NOT NULL,
      product_price DECIMAL(10, 2) NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("  ✅ Tabla 'order_items' creada");
}

async function createCouponsTable() {
  const exists = await tableExists("coupons");
  if (exists) {
    console.log("  ⏭️  Tabla 'coupons' ya existe");
    return;
  }

  await query(`
    CREATE TABLE coupons (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
      discount_value DECIMAL(10, 2) NOT NULL,
      min_purchase DECIMAL(10, 2) DEFAULT 0,
      max_uses INTEGER,
      uses_count INTEGER DEFAULT 0,
      expiry_date TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("  ✅ Tabla 'coupons' creada");
}

async function createCartItemsTable() {
  const exists = await tableExists("cart_items");
  if (exists) {
    console.log("  ⏭️  Tabla 'cart_items' ya existe");
    return;
  }

  await query(`
    CREATE TABLE cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    )
  `);
  console.log("  ✅ Tabla 'cart_items' creada");
}

async function createFavoritesTable() {
  const exists = await tableExists("favorites");
  if (exists) {
    console.log("  ⏭️  Tabla 'favorites' ya existe");
    return;
  }

  await query(`
    CREATE TABLE favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    )
  `);
  console.log("  ✅ Tabla 'favorites' creada");
}

async function createUpdatedAtFunction() {
  try {
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("  ✅ Función 'update_updated_at_column' creada");
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("  ⏭️  Función 'update_updated_at_column' ya existe");
    } else {
      throw error;
    }
  }
}

async function createTriggers() {
  const triggers = [
    { table: "products", name: "update_products_updated_at" },
    { table: "orders", name: "update_orders_updated_at" },
    { table: "cart_items", name: "update_cart_items_updated_at" }
  ];

  for (const { table, name } of triggers) {
    try {
      await query(`DROP TRIGGER IF EXISTS ${name} ON ${table}`);
      await query(`
        CREATE TRIGGER ${name}
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log(`  ✅ Trigger '${name}' creado`);
    } catch (error) {
      console.log(`  ⚠️  Error al crear trigger '${name}':`, error.message);
    }
  }
}

async function createIndexes() {
  const indexes = [
    { name: "idx_users_email", sql: "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)" },
    { name: "idx_users_username", sql: "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)" },
    { name: "idx_products_category", sql: "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)" },
    { name: "idx_addresses_user_id", sql: "CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id)" },
    { name: "idx_payment_methods_user_id", sql: "CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id)" },
    { name: "idx_orders_user_id", sql: "CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)" },
    { name: "idx_orders_status", sql: "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)" },
    { name: "idx_order_items_order_id", sql: "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)" },
    { name: "idx_coupons_code", sql: "CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)" },
    { name: "idx_cart_items_user_id", sql: "CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)" },
    { name: "idx_cart_items_product_id", sql: "CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id)" },
    { name: "idx_favorites_user_id", sql: "CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)" },
    { name: "idx_favorites_product_id", sql: "CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id)" }
  ];

  for (const { name, sql } of indexes) {
    try {
      await query(sql);
      console.log(`  ✅ Índice '${name}' creado`);
    } catch (error) {
      console.log(`  ⏭️  Índice '${name}' ya existe`);
    }
  }
}

async function seedInitialData() {
  // Verificar si ya hay datos
  const usersCount = await query("SELECT COUNT(*) as count FROM users");
  if (parseInt(usersCount.rows[0].count) > 0) {
    console.log("  ⏭️  Datos iniciales ya existen");
    return;
  }

  console.log("  🌱 Insertando datos iniciales...");

  // Usuario admin (password: admin123)
  await query(`
    INSERT INTO users (username, email, password, role) VALUES
    ('admin', 'admin@voidshop.com', '$2b$10$YourHashedPasswordHere', 'admin')
    ON CONFLICT (username) DO NOTHING
  `);

  // Productos iniciales
  await query(`
    INSERT INTO products (name, description, price, stock, category, image_url) VALUES
    ('Vestido Rojo Seda', 'Elegante vestido de seda roja perfecto para ocasiones especiales. Corte clásico que realza la figura.', 599.00, 15, 'Mujer', 'https://picsum.photos/seed/prod1/400/500'),
    ('Blazer Negro Premium', 'Blazer negro de corte moderno, ideal para el trabajo o eventos formales. Tela de alta calidad.', 899.00, 20, 'Hombre', 'https://picsum.photos/seed/prod2/400/500'),
    ('Bufanda de Lana Vino', 'Bufanda tejida a mano en tono vino. Suave y cálida, perfecta para el invierno.', 299.00, 30, 'Accesorio', 'https://picsum.photos/seed/prod3/400/500'),
    ('Zapatillas Deportivas', 'Zapatillas cómodas y modernas para uso diario. Suela antideslizante y diseño ergonómico.', 799.00, 25, 'Calzado', 'https://picsum.photos/seed/prod4/400/500'),
    ('Reloj Inteligente', 'Smartwatch con monitor de frecuencia cardíaca, GPS y resistencia al agua. Compatible con iOS y Android.', 1299.00, 10, 'Aparatos Electrónicos', 'https://picsum.photos/seed/prod5/400/500'),
    ('Gorra Snapback Unisex', 'Gorra ajustable de estilo urbano. Diseño minimalista y versátil para cualquier outfit.', 249.00, 40, 'Unisex', 'https://picsum.photos/seed/prod6/400/500'),
    ('Figura de Acción Coleccionable', 'Figura articulada de edición limitada con accesorios incluidos. Para coleccionistas y fans.', 499.00, 12, 'Juguete', 'https://picsum.photos/seed/prod7/400/500'),
    ('Camisa Blanca Formal', 'Camisa de vestir en algodón egipcio. Corte slim fit y acabado impecable.', 449.00, 35, 'Hombre', 'https://picsum.photos/seed/prod8/400/500'),
    ('Vestido Floral Verano', 'Vestido ligero con estampado floral. Perfecto para días soleados y paseos casuales.', 399.00, 18, 'Mujer', 'https://picsum.photos/seed/prod9/400/500'),
    ('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido activa. Batería de hasta 30 horas.', 899.00, 22, 'Aparatos Electrónicos', 'https://picsum.photos/seed/prod10/400/500')
    ON CONFLICT DO NOTHING
  `);

  // Cupones de ejemplo
  await query(`
    INSERT INTO coupons (code, discount_type, discount_value, min_purchase, max_uses, expiry_date) VALUES
    ('BIENVENIDO10', 'percentage', 10, 500, 100, '2025-12-31 23:59:59'),
    ('VERANO50', 'fixed', 50, 300, 50, '2025-06-30 23:59:59'),
    ('NAVIDAD2024', 'percentage', 20, 1000, NULL, '2025-12-25 23:59:59')
    ON CONFLICT (code) DO NOTHING
  `);

  console.log("  ✅ Datos iniciales insertados");
}
