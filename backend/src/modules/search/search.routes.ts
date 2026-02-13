import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { authenticate } from "../../hooks/authenticate";
import { searchQuerySchema, searchResponseSchema } from "./search.schemas";
import { SearchService } from "./search.service";

export async function searchRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const searchService = new SearchService();

  // All search routes require authentication
  server.addHook("preHandler", authenticate);

  // ---- GET /search ----
  server.get(
    "/",
    {
      schema: {
        tags: ["Search"],
        summary: "Unified search across multiple entities",
        security: [{ bearerAuth: [] }],
        querystring: searchQuerySchema,
        response: {
          200: searchResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "search.query";

      const { q, types, limit } = request.query;

      const result = await searchService.search(q, types, limit);

      request.ctx.resultCount = result.results.length;
      request.ctx.resultTotal = result.total;

      return reply.send(result);
    },
  );
}
