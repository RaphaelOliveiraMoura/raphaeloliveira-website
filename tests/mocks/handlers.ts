import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json({
      users: [
        { id: "1", name: "João Silva", email: "joao@example.com", role: "admin" },
        { id: "2", name: "Maria Santos", email: "maria@example.com", role: "user" },
      ],
    });
  }),

  http.get("/api/users/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: "João Silva",
      email: "joao@example.com",
      role: "admin",
    });
  }),

  http.post("/api/users", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: "3", ...body }, { status: 201 });
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const { email, password } = body;

    if (email === "joao@example.com" && password === "password123") {
      return HttpResponse.json({
        accessToken: "mock-access-token",
        user: { id: "1", name: "João Silva", email, role: "admin" },
      });
    }

    return HttpResponse.json(
      { message: "Credenciais inválidas" },
      { status: 401 }
    );
  }),

  http.post("/api/auth/refresh", () => {
    return HttpResponse.json({
      accessToken: "mock-refreshed-token",
    });
  }),
];
