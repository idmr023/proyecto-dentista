import http from 'http';
import { createRouter } from './router';
import { registerAuthRoutes } from './routes/auth.routes';
import { registerUserRoutes } from './routes/users.routes';
import { registerPatientRoutes } from './routes/patients.routes';
import { registerAppointmentRoutes } from './routes/appointments.routes';
import { registerOdontogramRoutes } from './routes/odontogram.routes';
import { registerProductRoutes } from './routes/products.routes';
import { registerOrderRoutes } from './routes/orders.routes';
import { registerStatsRoutes } from './routes/stats.routes';
import { getDb } from './db';

const PORT = process.env.PORT || 4000;

// Allow all origins for development (change to specific domains for production)
res.setHeader('Access-Control-Allow-Origin', '*');

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

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  router.handle(req, res);
});

// Init DB on startup
getDb();

server.listen(PORT, () => {
  console.log(`[API] Servidor corriendo en http://localhost:${PORT}`);
});
