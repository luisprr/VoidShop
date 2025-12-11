-- =============================================
-- VOIDSHOP DATABASE SCHEMA
-- Base de datos PostgreSQL
-- =============================================

-- Crear base de datos (ejecutar esto primero por separado)
-- CREATE DATABASE voidshop;

-- Conectarse a la base de datos voidshop antes de ejecutar el resto
-- \c voidshop

-- =============================================
-- TABLA: users
-- Almacena información de usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: products
-- Almacena catálogo de productos
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: addresses
-- Almacena direcciones de envío de usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'México',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: payment_methods
-- Almacena métodos de pago (tarjetas encriptadas)
-- =============================================
CREATE TABLE IF NOT EXISTS payment_methods (
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
);

-- =============================================
-- TABLA: orders
-- Almacena órdenes de compra
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
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
);

-- =============================================
-- TABLA: order_items
-- Almacena items individuales de cada orden
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: coupons
-- Almacena cupones de descuento
-- =============================================
CREATE TABLE IF NOT EXISTS coupons (
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
);

-- =============================================
-- ÍNDICES para mejorar performance
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_coupons_code ON coupons(code);

-- =============================================
-- TABLA: cart_items
-- Almacena items del carrito de compras
-- =============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- =============================================
-- TABLA: favorites
-- Almacena productos favoritos de usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Índices para cart_items y favorites
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- =============================================
-- DATOS INICIALES (SEED DATA)
-- =============================================

-- Usuario admin (password: admin123)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@voidshop.com', '$2b$10$8ZqWYKzX0h0EbqX.qEY.9u5vF8X0X0X0X0X0X0X0X0X0X0X0X0X0X', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Productos iniciales
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
ON CONFLICT DO NOTHING;

-- Cupones de ejemplo
INSERT INTO coupons (code, discount_type, discount_value, min_purchase, max_uses, expiry_date) VALUES
('BIENVENIDO10', 'percentage', 10, 500, 100, '2025-12-31 23:59:59'),
('VERANO50', 'fixed', 50, 300, 50, '2025-06-30 23:59:59'),
('NAVIDAD2024', 'percentage', 20, 1000, NULL, '2024-12-25 23:59:59')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- FUNCIONES ÚTILES
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();



-- Script de migración para agregar tablas de carrito y favoritos
-- Ejecutar desde pgAdmin o psql conectado a la base de datos voidshop

-- Crear tabla cart_items
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Crear tabla favorites
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Crear índices para cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Crear índices para favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- Crear trigger para actualizar updated_at en cart_items
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que las tablas se crearon correctamente
SELECT 'Tablas creadas exitosamente' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cart_items', 'favorites');

-- =============================================
-- FIN DEL SCHEMA
-- =============================================