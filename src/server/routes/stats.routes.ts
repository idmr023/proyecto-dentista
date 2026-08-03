import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db';
import { requireRole, ok } from '../middleware';

export function registerStatsRoutes(router: any) {
  // GET /api/stats (admin only)
  router.get('/api/stats', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const db = getDb();

    const totalPatients = (db.prepare('SELECT COUNT(*) as count FROM patients').get() as any).count;
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = (db.prepare(
      "SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND status != 'cancelada'"
    ).get(todayStr) as any).count;

    const pendingAppointments = (db.prepare(
      "SELECT COUNT(*) as count FROM appointments WHERE status = 'pendiente'"
    ).get() as any).count;

    const totalRevenue = (db.prepare(
      "SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'pagada'"
    ).get() as any).total;

    const monthOrders = (db.prepare(
      "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM orders WHERE created_at >= date('now', 'start of month')"
    ).get() as any);

    const activeTreatments = (db.prepare(
      "SELECT COUNT(*) as count FROM appointments WHERE status IN ('pendiente', 'confirmada')"
    ).get() as any).count;

    ok(res, {
      totalPatients,
      totalUsers,
      totalProducts,
      todayAppointments,
      pendingAppointments,
      totalRevenue,
      monthOrders: monthOrders.count,
      monthRevenue: monthOrders.total,
      activeTreatments,
    });
  });
}
