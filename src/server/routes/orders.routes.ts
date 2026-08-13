import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { requireAuth, requireRole, parseJson, ok, error, created } from '../middleware.js';
import { orderSchema } from '../../shared/schemas.js';
import { randomUUID } from 'crypto';

export function registerOrderRoutes(router: any) {
  // POST /api/orders
  router.post('/api/orders', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const body = await parseJson(req);
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) { error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos'); return; }

    const db = getDb();
    const orderId = randomUUID();
    let total = 0;

    for (const item of parsed.data.items) {
      const product = await db.get('SELECT id, name, price, stock FROM products WHERE id = ?', item.product_id) as any;
      if (!product) { error(res, 404, `Producto ${item.product_id} no encontrado.`); return; }
      if (product.stock < item.qty) { error(res, 400, `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`); return; }
      total += product.price * item.qty;
    }

    await db.run('INSERT INTO orders (id, user_id, total) VALUES (?, ?, ?)', orderId, user.sub, total);
    for (const item of parsed.data.items) {
      const product = await db.get('SELECT id, name, price FROM products WHERE id = ?', item.product_id) as any;
      await db.run(
        'INSERT INTO order_items (id, order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?, ?)',
        randomUUID(), orderId, item.product_id, product.name, product.price, item.qty
      );
      await db.run('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', item.qty, item.product_id, item.qty);
    }
    await db.run('UPDATE orders SET total = ? WHERE id = ?', total, orderId);

    const order = await db.get('SELECT * FROM orders WHERE id = ?', orderId);
    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', orderId);
    created(res, { order: { ...order, items } });
  });

  // GET /api/orders
  router.get('/api/orders', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    let orders;

    if (user.role === 'admin' || user.role === 'colaborador') {
      orders = await db.all(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);
    } else {
      orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', user.sub);
    }

    for (const order of orders as any[]) {
      order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', order.id);
    }

    ok(res, { orders });
  });

  // PATCH /api/orders/:id/status
  router.patch('/api/orders/:id/status', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    if (!body.status || !['pendiente', 'pagada', 'cancelada'].includes(body.status)) {
      error(res, 400, 'Estado inválido.'); return;
    }

    const db = getDb();
    const result = await db.run('UPDATE orders SET status = ? WHERE id = ?', body.status, id);
    if (result.changes === 0) { error(res, 404, 'Pedido no encontrado.'); return; }

    const order = await db.get('SELECT * FROM orders WHERE id = ?', id);
    ok(res, { order });
  });
}
