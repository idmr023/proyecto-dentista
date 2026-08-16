import { registerMedicalHistoryRoutes } from './routes/medical_histories.routes.js';
import { registerAuthRoutes } from './routes/auth.routes.js';
import { registerUserRoutes } from './routes/users.routes.js';
import { registerPatientRoutes } from './routes/patients.routes.js';
import { registerAppointmentRoutes } from './routes/appointments.routes.js';
import { registerOdontogramRoutes } from './routes/odontogram.routes.js';
import { registerProductRoutes } from './routes/products.routes.js';
import { registerOrderRoutes } from './routes/orders.routes.js';
import { registerStatsRoutes } from './routes/stats.routes.js';
import { initDb } from './db.js';

const PORT = process.env.PORT || 4000;
const DIST_DIR = resolve(import.meta.dirname || __dirname, '../../dist');
const INDEX_HTML = join(DIST_DIR, 'index.html');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    pathname = url.pathname;
  }

  if (pathname.startsWith('/api')) return false;

  if (pathname === '/') pathname = '/index.html';

  let filePath = join(DIST_DIR, pathname);
  if (!existsSync(filePath) || filePath.startsWith(DIST_DIR) === false) {
    if (!existsSync(INDEX_HTML)) return false;
    filePath = INDEX_HTML;
  }

  try {
    const ext = filePath.endsWith('.html') ? '.html' : (extname(filePath) || '.html');
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    return false;
  }
  return true;
}

const router = createRouter();

// Register all routes
registerAuthRoutes(router);
registerUserRoutes(router);
registerPatientRoutes(router);
registerAppointmentRoutes(router);
registerOdontogramRoutes(router);
registerProductRoutes(router);
registerOrderRoutes(router);
registerStatsRoutes(router);
registerMedicalHistoryRoutes(router);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (serveStatic(req, res)) return;

  router.handle(req, res);
});

// Init DB on startup
initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`[API] Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('[DB] Error al inicializar:', err);
  process.exit(1);
});
