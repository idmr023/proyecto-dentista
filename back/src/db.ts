import { Pool } from 'pg';
import { randomUUID, scryptSync, randomBytes } from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[DB] DATABASE_URL no está configurada.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export function getDb() {
  return {
    async get(sql: string, ...params: any[]) {
      const pgSql = sql.replace(/\?/g, (_, i) => `$${i + 1}`);
      const result = await pool.query(pgSql, params);
      return result.rows[0] || null;
    },
    async all(sql: string, ...params: any[]) {
      const pgSql = sql.replace(/\?/g, (_, i) => `$${i + 1}`);
      const result = await pool.query(pgSql, params);
      return result.rows;
    },
    async run(sql: string, ...params: any[]) {
      const pgSql = sql.replace(/\?/g, (_, i) => `$${i + 1}`);
      const result = await pool.query(pgSql, params);
      return { changes: result.rowCount };
    },
    async exec(sql: string) {
      await pool.query(sql);
    },
  };
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','colaborador','cliente')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')::text
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      birth_date TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      user_id TEXT,
      created_at TEXT NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')::text,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      service TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente','confirmada','cancelada','completada')),
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')::text,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS tooth_marks (
      patient_id TEXT NOT NULL,
      tooth_id INTEGER NOT NULL CHECK(tooth_id >= 11 AND tooth_id <= 48),
      tool TEXT NOT NULL,
      face TEXT NOT NULL DEFAULT 'all' CHECK(face IN ('all','oclusal','vestibular','palatina','mesial','distal')),
      updated_at TEXT NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')::text,
      PRIMARY KEY (patient_id, tooth_id, tool, face),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente','pagada','cancelada')),
      created_at TEXT NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')::text,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      qty INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')::text,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      ip TEXT NOT NULL,
      success INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')::text
    );

    CREATE INDEX IF NOT EXISTS idx_login_attempts_email_ip ON login_attempts(email, ip);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);

  await seed();
}

function hashPassword(password: string, salt: Buffer) {
  return scryptSync(password, salt, 64).toString('hex');
}

async function seed() {
  const db = getDb();
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count > 0) return;

  const salt = randomBytes(32);
  const defaultPass = hashPassword('Admin1234!', salt);

  const users = [
    { id: randomUUID(), name: 'Administrador', email: 'admin@twilightdental.com', role: 'admin' },
    { id: randomUUID(), name: 'Carlos Colaborador', email: 'colaborador@twilightdental.com', role: 'colaborador' },
    { id: randomUUID(), name: 'María Paciente', email: 'cliente@twilightdental.com', role: 'cliente' },
  ];

  for (const u of users) {
    await db.run(
      'INSERT INTO users (id, name, email, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)',
      u.id, u.name, u.email, defaultPass, salt.toString('hex'), u.role
    );
  }

  const products = [
    { id: randomUUID(), name: 'Kit de Higiene Oral Completo', description: 'Cepillo, pasta, hilo y enjuague bucal.', price: 45.00, stock: 50 },
    { id: randomUUID(), name: 'Pasta Dental Blanqueadora Pro', description: 'Protección avanzada antimanchas.', price: 25.00, stock: 80 },
    { id: randomUUID(), name: 'Hilo Dental con Cera y Flúor', description: 'Limpieza interdental profunda.', price: 15.00, stock: 120 },
    { id: randomUUID(), name: 'Enjuague Bucal Sin Alcohol', description: 'Aliento fresco y protección prolongada.', price: 30.00, stock: 60 },
    { id: randomUUID(), name: 'Cepillo Eléctrico Dental', description: 'Sonics pro con 3 modos de limpieza.', price: 89.00, stock: 25 },
    { id: randomUUID(), name: 'Mini Kit Dental para Viaje', description: 'Cepillo, pasta y estuche compacto.', price: 22.00, stock: 100 },
  ];

  for (const p of products) {
    await db.run(
      'INSERT INTO products (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)',
      p.id, p.name, p.description, p.price, p.stock
    );
  }

  const patients = [
    { id: randomUUID(), name: 'Carlos Mendoza', phone: '+51 987 654 321', email: 'carlos@email.com', birth_date: '1990-05-15', notes: 'Paciente frecuente. En tratamiento de ortodoncia.', user_id: null },
    { id: randomUUID(), name: 'Ana Lucía Torres', phone: '+51 912 345 678', email: 'ana@email.com', birth_date: '1985-11-22', notes: 'Historial de endodoncia en diente 36.', user_id: null },
    { id: randomUUID(), name: 'Jorge Ramirez', phone: '+51 945 789 012', email: 'jorge@email.com', birth_date: '1978-03-08', notes: 'Pendiente de implante dental.', user_id: null },
  ];

  for (const p of patients) {
    await db.run(
      'INSERT INTO patients (id, name, phone, email, birth_date, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      p.id, p.name, p.phone, p.email, p.birth_date, p.notes, p.user_id
    );
  }

  await db.run(
    'INSERT INTO patients (id, name, phone, email, birth_date, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    randomUUID(), 'María Paciente', '+51 900 000 001', 'cliente@twilightdental.com', '', 'Paciente registrada vía portal.', users[2].id
  );

  await db.run(
    'INSERT INTO appointments (id, patient_id, service, appointment_date, appointment_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    randomUUID(), patients[0].id, 'Ortodoncia', '2026-08-04', '10:00', 'confirmada', 'Control de brackets'
  );
  await db.run(
    'INSERT INTO appointments (id, patient_id, service, appointment_date, appointment_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    randomUUID(), patients[1].id, 'Endodoncia', '2026-08-04', '15:00', 'pendiente', 'Revisión diente 36'
  );
  await db.run(
    'INSERT INTO appointments (id, patient_id, service, appointment_date, appointment_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    randomUUID(), patients[2].id, 'Implantes', '2026-08-05', '11:00', 'confirmada', 'Evaluación previa a implante'
  );

  console.log('[DB] Base de datos inicializada con seed data.');
}

export default getDb;
