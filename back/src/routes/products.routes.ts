import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { ok } from '../middleware.js';

export function registerProductRoutes(router: any) {
  // GET /api/products (public)
  router.get('/api/products', async (req: IncomingMessage, res: ServerResponse) => {
    const db = getDb();
    const products = await db.all('SELECT * FROM products WHERE stock > 0 ORDER BY name');
    ok(res, { products });
  });
}
