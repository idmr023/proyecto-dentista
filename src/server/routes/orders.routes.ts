import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.ts';
import { requireAuth, requireRole, parseJson, ok, error, created } from '../middleware.ts';
import { orderSchema } from '../../shared/schemas.ts';
import { randomUUID } from 'crypto';

export function registerOrderRoutes(router: any) {
  // POST /api/orders (authenticated users)
  router.post('/api/orders', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const body = await parseJson(req);
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
      return;
    }

    const db = getDb();
    const orderId = randomUUID();
    let total = 0;

    const insertOrder = db.prepare('INSERT INTO orders (id, user_id, total) VALUES (?, ?, ?)');
    const insertItem = db.prepare(
      'INSERT INTO order_items (id, order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const updateTotal = db.prepare('UPDATE orders SET total = ? WHERE id = ?');
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');

    for (const item of parsed.data.items) {
      const product = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?').get(item.product_id) as any;
      if (!product) {
        error(res, 404, `Producto ${item.product_id} no encontrado.`);
        return;
      }
      if (product.stock < item.qty) {
        error(res, 400, `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`);
        return;
      }
      total += product.price * item.qty;
    }

    insertOrder.run(orderId, user.sub, total);
    for (const item of parsed.data.items) {
      const product = db.prepare('SELECT id, name, price FROM products WHERE id = ?').get(item.product_id) as any;
      insertItem.run(randomUUID(), orderId, item.product_id, product.name, product.price, item.qty);
      updateStock.run(item.qty, item.product_id, item.qty);
    }
    updateTotal.run(total, orderId);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    created(res, { order: { ...order, items } });
  });

  // GET /api/orders (admin → all, cliente → own)
  router.get('/api/orders', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    let orders;

    if (user.role === 'admin' || user.role === 'colaborador') {
      orders = db.prepare(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `).all();
    } else {
      orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.sub);
    }

    for (const order of orders as any[]) {
      order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    }

    ok(res, { orders });
  });

  // PATCH /api/orders/:id/status (admin only)
  router.patch('/api/orders/:id/status', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    if (!body.status || !['pendiente', 'pagada', 'cancelada'].includes(body.status)) {
      error(res, 400, 'Estado inválido.');
      return;
    }

    const db = getDb();
    const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(body.status, id);
    if (result.changes === 0) {
      error(res, 404, 'Pedido no encontrado.');
      return;
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    ok(res, { order });
  });
}
