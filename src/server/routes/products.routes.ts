import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db';
import { ok } from '../middleware';

export function registerProductRoutes(router: any) {
  // GET /api/products (public)
  router.get('/api/products', async (req: IncomingMessage, res: ServerResponse) => {
    const db = getDb();
    const products = db.prepare('SELECT * FROM products WHERE stock > 0 ORDER BY name').all();
    ok(res, { products });
  });
}
