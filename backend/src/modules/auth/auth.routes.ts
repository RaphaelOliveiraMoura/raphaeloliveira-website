import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { env } from "../../config/env";
import { authenticate } from "../../hooks/authenticate";
import { NotFoundError, UnauthorizedError } from "../../lib/errors";
import {
  forgotPasswordSchema,
  loginResponseSchema,
  loginSchema,
  meResponseSchema,
  refreshResponseSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schemas";
import { AuthService } from "./auth.service";

/** Cookie name for the refresh token */
const REFRESH_COOKIE = "refresh-token";

/** Max age for the refresh token cookie (seconds) */
function getRefreshCookieMaxAge(): number {
  const match = env.JWT_REFRESH_EXPIRATION.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60; // 7 days in seconds

  const value = parseInt(match[1]!, 10);
  switch (match[2]) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const authService = new AuthService(app);

  // ---- POST /auth/login ----
  server.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Login with email and password",
        body: loginSchema,
        response: {
          200: loginResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "auth.login";
      request.ctx.authEmail = request.body.email;

      const result = await authService.login(request.body, request.ip);

      // Enrich ctx with the authenticated user after successful login
      request.ctx.userId = result.user.id;
      request.ctx.userRole = result.user.role;

      // Set refresh token as httpOnly cookie
      reply.setCookie(REFRESH_COOKIE, result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: getRefreshCookieMaxAge(),
      });

      return reply.send({
        accessToken: result.accessToken,
        user: result.user,
      });
    },
  );

  // ---- POST /auth/refresh ----
  server.post(
    "/refresh",
    {
      schema: {
        tags: ["Auth"],
        summary: "Refresh the access token",
        response: {
          200: refreshResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "auth.refresh";

      const token = request.cookies[REFRESH_COOKIE];

      if (!token) {
        throw new UnauthorizedError("No refresh token provided");
      }

      const result = await authService.refresh(token);

      // Set the new rotated refresh token cookie
      reply.setCookie(REFRESH_COOKIE, result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: getRefreshCookieMaxAge(),
      });

      return reply.send({ accessToken: result.accessToken });
    },
  );

  // ---- POST /auth/logout ----
  server.post(
    "/logout",
    {
      schema: {
        tags: ["Auth"],
        summary: "Logout and revoke refresh token",
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "auth.logout";

      const token = request.cookies[REFRESH_COOKIE];

      if (token) {
        await authService.logout(token);
      }

      reply.clearCookie(REFRESH_COOKIE, { path: "/" });

      return reply.send({ success: true });
    },
  );

  // ---- GET /auth/me ----
  server.get(
    "/me",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Auth"],
        summary: "Get the authenticated user profile",
        security: [{ bearerAuth: [] }],
        response: {
          200: meResponseSchema,
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "auth.me";

      const user = await authService.getMe(request.user.id);

      if (!user) {
        throw new NotFoundError("User", request.user.id);
      }

      return reply.send(user);
    },
  );

  // ---- POST /auth/forgot-password ----
  server.post(
    "/forgot-password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Request a password reset email",
        body: forgotPasswordSchema,
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "auth.forgot-password";
      request.ctx.authEmail = request.body.email;

      // Always returns success to prevent email enumeration
      await authService.forgotPassword(request.body);

      return reply.send({ success: true });
    },
  );

  // ---- POST /auth/reset-password ----
  server.post(
    "/reset-password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Reset password using a token",
        body: resetPasswordSchema,
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "auth.reset-password";

      await authService.resetPassword(request.body);

      return reply.send({ success: true });
    },
  );

  // ---- POST /auth/send-verification ----
  server.post(
    "/send-verification",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Auth"],
        summary: "Send email verification link",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "auth.send-verification";

      await authService.sendVerificationEmail(request.user.id);

      return reply.send({ success: true });
    },
  );

  // ---- POST /auth/verify-email ----
  server.post(
    "/verify-email",
    {
      schema: {
        tags: ["Auth"],
        summary: "Verify email address using a token",
        body: verifyEmailSchema,
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      request.ctx.action = "auth.verify-email";

      await authService.verifyEmail(request.body);

      return reply.send({ success: true });
    },
  );
}
