import type { IncomingMessage, ServerResponse } from 'http';
import type { RouteHandler } from './middleware.ts';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Route {
  method: HttpMethod;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export function createRouter() {
  const routes: Route[] = [];

  function addRoute(method: HttpMethod, path: string, handler: RouteHandler) {
    const paramNames: string[] = [];
    const regex = path.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    routes.push({ method, pattern: new RegExp(`^${regex}$`), paramNames, handler });
  }

  return {
    get: (path: string, h: RouteHandler) => addRoute('GET', path, h),
    post: (path: string, h: RouteHandler) => addRoute('POST', path, h),
    put: (path: string, h: RouteHandler) => addRoute('PUT', path, h),
    patch: (path: string, h: RouteHandler) => addRoute('PATCH', path, h),
    delete: (path: string, h: RouteHandler) => addRoute('DELETE', path, h),

    handle(req: IncomingMessage, res: ServerResponse) {
      const method = req.method?.toUpperCase() as HttpMethod;
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const pathname = url.pathname;

      for (const route of routes) {
        if (route.method !== method) continue;
        const match = pathname.match(route.pattern);
        if (!match) continue;

        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });

        // Set query params on request
        (req as any).query = Object.fromEntries(url.searchParams);
        (req as any).params = params;

        return route.handler(req, res, params);
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
    },
  };
}

export type Router = ReturnType<typeof createRouter>;
