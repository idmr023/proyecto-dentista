import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { requireRole, ok } from '../middleware.js';

export function registerStatsRoutes(router: any) {
  // GET /api/stats
  router.get('/api/stats', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const db = getDb();

    const totalPatients = await db.get('SELECT COUNT(*) as count FROM patients') as any;
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users') as any;
    const totalProducts = await db.get('SELECT COUNT(*) as count FROM products') as any;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = await db.get(
      "SELECT COUNT(*) as count FROM appointments WHERE appointment_date = $1 AND status != 'cancelada'",
      todayStr
    ) as any;

    const pendingAppointments = await db.get(
      "SELECT COUNT(*) as count FROM appointments WHERE status = 'pendiente'"
    ) as any;

    const totalRevenue = await db.get(
      "SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'pagada'"
    ) as any;

    const monthOrders = await db.get(
      "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM orders WHERE created_at >= (NOW() AT TIME ZONE 'utc')::date::text"
    ) as any;

    const activeTreatments = await db.get(
      "SELECT COUNT(*) as count FROM appointments WHERE status IN ('pendiente', 'confirmada')"
    ) as any;

    ok(res, {
      totalPatients: totalPatients?.count || 0,
      totalUsers: totalUsers?.count || 0,
      totalProducts: totalProducts?.count || 0,
      todayAppointments: todayAppointments?.count || 0,
      pendingAppointments: pendingAppointments?.count || 0,
      totalRevenue: totalRevenue?.total || 0,
      monthOrders: monthOrders?.count || 0,
      monthRevenue: monthOrders?.total || 0,
      activeTreatments: activeTreatments?.count || 0,
    });
  });
}
