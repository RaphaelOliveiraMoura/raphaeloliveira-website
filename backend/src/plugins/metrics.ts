import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import client from "prom-client";

/**
 * Prometheus metrics plugin.
 *
 * Collects default Node.js metrics (CPU, memory, event loop, GC)
 * plus custom HTTP request metrics.
 *
 * Metrics are exposed at `GET /metrics` in Prometheus text format.
 */
export default fp(
  async (app: FastifyInstance) => {
    // Collect default Node.js metrics
    client.collectDefaultMetrics({
      prefix: "corestack_",
    });

    // ---- Custom metrics ----

    const httpRequestDuration = new client.Histogram({
      name: "corestack_http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route", "status_code"] as const,
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });

    const httpRequestsTotal = new client.Counter({
      name: "corestack_http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"] as const,
    });

    const httpActiveRequests = new client.Gauge({
      name: "corestack_http_active_requests",
      help: "Number of active HTTP requests",
    });

    // ---- Hooks ----

    app.addHook("onRequest", async (_request: FastifyRequest) => {
      httpActiveRequests.inc();
    });

    app.addHook(
      "onResponse",
      async (request: FastifyRequest, reply: FastifyReply) => {
        httpActiveRequests.dec();

        const route = request.routeOptions?.url ?? request.url;
        const method = request.method;
        const statusCode = reply.statusCode.toString();

        // Record duration
        const durationMs = request.ctx?.startTime
          ? Date.now() - request.ctx.startTime
          : 0;

        httpRequestDuration.observe(
          { method, route, status_code: statusCode },
          durationMs / 1000,
        );

        httpRequestsTotal.inc({
          method,
          route,
          status_code: statusCode,
        });
      },
    );

    // ---- Metrics endpoint ----

    app.get(
      "/metrics",
      {
        schema: {
          tags: ["Monitoring"],
          summary: "Prometheus metrics",
          hide: true,
        },
      },
      async (_request, reply) => {
        const metrics = await client.register.metrics();

        return reply
          .header("Content-Type", client.register.contentType)
          .send(metrics);
      },
    );
  },
  {
    name: "metrics",
    dependencies: ["request-context"],
  },
);
