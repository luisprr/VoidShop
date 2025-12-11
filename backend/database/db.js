// =============================================
// CONEXIÓN A POSTGRESQL
// =============================================
import pg from "pg";
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "admin",
      database: process.env.DB_NAME || "voidshop",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

pool.connect((err, client, release) => {
  if (err) {
    console.error("Error al conectar a PostgreSQL:", err.stack);
    process.exit(1); 
  } else {
    console.log(`Conectado a PostgreSQL (Base de datos: ${process.env.DB_NAME || "voidshop"})`);
    release(); 
  }
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
  process.exit(-1);
});

// =============================================
// FUNCIONES AUXILIARES
// =============================================

/**
 * Ejecutar una consulta SQL
 * @param {string} text - Query SQL
 * @param {Array} params - Parámetros de la query
 * @returns {Promise} Resultado de la query
 */
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error("Error en query:", error.message);
    throw error;
  }
}

/**
 * Obtener un cliente del pool para transacciones
 * @returns {Promise} Cliente de PostgreSQL
 */
async function getClient() {
  const client = await pool.connect();
  
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  const timeout = setTimeout(() => {
    console.error("Cliente no liberado después de 5s");
    client.release();
  }, 5000);
  
  client.release = () => {
    clearTimeout(timeout);
    release();
  };
  
  return client;
}

/**
 * Ejecutar una transacción
 * @param {Function} callback - Función que contiene las queries de la transacción
 * @returns {Promise} Resultado de la transacción
 * 
 * Ejemplo de uso:
 * await transaction(async (client) => {
 *   await client.query('INSERT INTO users ...');
 *   await client.query('INSERT INTO addresses ...');
 * });
 */
async function transaction(callback) {
  const client = await getClient();
  
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// =============================================
// FUNCIONES DE UTILIDAD PARA MIGRACIONES
// =============================================

/**
 * Verificar si una tabla existe
 */
async function tableExists(tableName) {
  const result = await query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )`,
    [tableName]
  );
  return result.rows[0].exists;
}

/**
 * Obtener todas las tablas de la base de datos
 */
async function getAllTables() {
  const result = await query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return result.rows.map(row => row.table_name);
}

/**
 * Limpiar todas las tablas (para testing)
 */
async function clearAllTables() {
  const tables = await getAllTables();
  
  for (const table of tables) {
    await query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
  }
  
  console.log(`🧹 ${tables.length} tablas limpiadas`);
}

// =============================================
// CERRAR CONEXIONES AL SALIR
// =============================================
process.on("SIGINT", async () => {
  console.log("\n🔌 Cerrando conexiones a PostgreSQL...");
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🔌 Cerrando conexiones a PostgreSQL...");
  await pool.end();
  process.exit(0);
});

// =============================================
// EXPORTAR
// =============================================
export {
  query,
  getClient,
  transaction,
  pool,
  // Utilidades
  tableExists,
  getAllTables,
  clearAllTables,
};
