import { DatabaseSync } from 'node:sqlite';
import { randomUUID, scryptSync, randomBytes } from 'crypto';
import { resolve } from 'path';

const DB_PATH = resolve(import.meta.dirname || __dirname, '../../database/dentista.db');
let db: DatabaseSync;

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    initSchema();
    seed();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','colaborador','cliente')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      birth_date TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      user_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS tooth_marks (
      patient_id TEXT NOT NULL,
      tooth_id INTEGER NOT NULL CHECK(tooth_id >= 11 AND tooth_id <= 48),
      tool TEXT NOT NULL,
      face TEXT NOT NULL DEFAULT 'all' CHECK(face IN ('all','oclusal','vestibular','palatina','mesial','distal')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      ip TEXT NOT NULL,
      success INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_login_attempts_email_ip ON login_attempts(email, ip);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);

  migrateToothMarks();
  migratePatientsUserId();
}

function migratePatientsUserId() {
  const cols = db.prepare('PRAGMA table_info(patients)').all() as { name: string }[];
  if (cols.some(c => c.name === 'user_id')) return;

  db.exec('ALTER TABLE patients ADD COLUMN user_id TEXT REFERENCES users(id)');

  const clients = db.prepare("SELECT id, name, email FROM users WHERE role = 'cliente'").all() as { id: string; name: string; email: string }[];
  const hasPatient = db.prepare('SELECT id FROM patients WHERE user_id = ?');
  const byEmail = db.prepare('SELECT id FROM patients WHERE email = ?');
  const linkStmt = db.prepare('UPDATE patients SET user_id = ? WHERE id = ?');
  const insertStmt = db.prepare('INSERT INTO patients (id, name, phone, email, user_id) VALUES (?, ?, ?, ?, ?)');

  for (const client of clients) {
    if (hasPatient.get(client.id)) continue;
    const existing = byEmail.get(client.email) as { id: string } | undefined;
    if (existing) {
      linkStmt.run(client.id, existing.id);
    } else {
      insertStmt.run(randomUUID(), client.name, '', client.email, client.id);
    }
  }
}

function migrateToothMarks() {
  const cols = db.prepare('PRAGMA table_info(tooth_marks)').all() as { name: string }[];
  if (cols.some(c => c.name === 'face')) return;

  db.exec(`
    ALTER TABLE tooth_marks RENAME TO tooth_marks_old;

    CREATE TABLE tooth_marks (
      patient_id TEXT NOT NULL,
      tooth_id INTEGER NOT NULL CHECK(tooth_id >= 11 AND tooth_id <= 48),
      tool TEXT NOT NULL,
      face TEXT NOT NULL DEFAULT 'all' CHECK(face IN ('all','oclusal','vestibular','palatina','mesial','distal')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (patient_id, tooth_id, tool, face),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    INSERT INTO tooth_marks (patient_id, tooth_id, tool, face, updated_at)
      SELECT patient_id, tooth_id, tool, 'all', updated_at FROM tooth_marks_old;

    DROP TABLE tooth_marks_old;
  `);
}

function hashPassword(password: string, salt: Buffer) {
  return scryptSync(password, salt, 64).toString('hex');
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  const salt = randomBytes(32);
  const defaultPass = hashPassword('Admin1234!', salt);

  const users = [
    { id: randomUUID(), name: 'Administrador', email: 'admin@twilightdental.com', role: 'admin' },
    { id: randomUUID(), name: 'Carlos Colaborador', email: 'colaborador@twilightdental.com', role: 'colaborador' },
    { id: randomUUID(), name: 'María Paciente', email: 'cliente@twilightdental.com', role: 'cliente' },
  ];

  const insertUser = db.prepare('INSERT INTO users (id, name, email, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)');
  for (const u of users) {
    insertUser.run(u.id, u.name, u.email, defaultPass, salt.toString('hex'), u.role);
  }

  const products = [
    { id: randomUUID(), name: 'Kit de Higiene Oral Completo', description: 'Cepillo, pasta, hilo y enjuague bucal.', price: 45.00, stock: 50 },
    { id: randomUUID(), name: 'Pasta Dental Blanqueadora Pro', description: 'Protección avanzada antimanchas.', price: 25.00, stock: 80 },
    { id: randomUUID(), name: 'Hilo Dental con Cera y Flúor', description: 'Limpieza interdental profunda.', price: 15.00, stock: 120 },
    { id: randomUUID(), name: 'Enjuague Bucal Sin Alcohol', description: 'Aliento fresco y protección prolongada.', price: 30.00, stock: 60 },
    { id: randomUUID(), name: 'Cepillo Eléctrico Dental', description: 'Sonics pro con 3 modos de limpieza.', price: 89.00, stock: 25 },
    { id: randomUUID(), name: 'Mini Kit Dental para Viaje', description: 'Cepillo, pasta y estuche compacto.', price: 22.00, stock: 100 },
  ];

  const insertProduct = db.prepare('INSERT INTO products (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)');
  for (const p of products) {
    insertProduct.run(p.id, p.name, p.description, p.price, p.stock);
  }

  const patients = [
    { id: randomUUID(), name: 'Carlos Mendoza', phone: '+51 987 654 321', email: 'carlos@email.com', birth_date: '1990-05-15', notes: 'Paciente frecuente. En tratamiento de ortodoncia.', user_id: null },
    { id: randomUUID(), name: 'Ana Lucía Torres', phone: '+51 912 345 678', email: 'ana@email.com', birth_date: '1985-11-22', notes: 'Historial de endodoncia en diente 36.', user_id: null },
    { id: randomUUID(), name: 'Jorge Ramirez', phone: '+51 945 789 012', email: 'jorge@email.com', birth_date: '1978-03-08', notes: 'Pendiente de implante dental.', user_id: null },
  ];

  const insertPatient = db.prepare('INSERT INTO patients (id, name, phone, email, birth_date, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const p of patients) {
    insertPatient.run(p.id, p.name, p.phone, p.email, p.birth_date, p.notes, p.user_id || null);
  }
  insertPatient.run(randomUUID(), 'María Paciente', '+51 900 000 001', 'cliente@twilightdental.com', '', 'Paciente registrada vía portal.', users[2].id);

  const insertAppointment = db.prepare('INSERT INTO appointments (id, patient_id, service, appointment_date, appointment_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertAppointment.run(randomUUID(), patients[0].id, 'Ortodoncia', '2026-08-04', '10:00', 'confirmada', 'Control de brackets');
  insertAppointment.run(randomUUID(), patients[1].id, 'Endodoncia', '2026-08-04', '15:00', 'pendiente', 'Revisión diente 36');
  insertAppointment.run(randomUUID(), patients[2].id, 'Implantes', '2026-08-05', '11:00', 'confirmada', 'Evaluación previa a implante');

  console.log('[DB] Base de datos inicializada con seed data.');
}

export default getDb;
