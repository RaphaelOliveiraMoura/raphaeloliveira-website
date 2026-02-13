/**
 * Template data that can be interpolated into email templates.
 */
export interface TemplateData {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Base layout wrapper for all email templates.
 */
function baseLayout(content: string, appName = "Core Stack"): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${appName}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { color: #18181b; font-size: 24px; margin: 0; }
    .content { color: #3f3f46; font-size: 16px; line-height: 1.6; }
    .btn { display: inline-block; background-color: #18181b; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px; }
    .code { background: #f4f4f5; border-radius: 4px; padding: 12px 16px; font-family: monospace; font-size: 24px; letter-spacing: 4px; text-align: center; color: #18181b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header"><h1>${appName}</h1></div>
      <div class="content">${content}</div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>`;
}

// ---- Email templates ----

const TEMPLATES = {
  welcome: (data: TemplateData) => ({
    subject: `Bem-vindo ao ${data.appName ?? "Core Stack"}!`,
    html: baseLayout(
      `
      <p>Olá, <strong>${data.name}</strong>!</p>
      <p>Sua conta foi criada com sucesso. Estamos felizes em ter você conosco.</p>
      ${data.loginUrl ? `<p><a href="${data.loginUrl}" class="btn">Acessar plataforma</a></p>` : ""}
    `,
      data.appName as string,
    ),
  }),

  "password-reset": (data: TemplateData) => ({
    subject: "Redefinição de senha",
    html: baseLayout(
      `
      <p>Olá, <strong>${data.name}</strong>!</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Use o link abaixo para criar uma nova senha:</p>
      <p style="text-align: center;"><a href="${data.resetUrl}" class="btn">Redefinir senha</a></p>
      <p>Este link expira em <strong>${data.expiresIn ?? "1 hora"}</strong>.</p>
      <p>Se você não solicitou esta redefinição, ignore este email.</p>
    `,
      data.appName as string,
    ),
  }),

  "email-verification": (data: TemplateData) => ({
    subject: "Verifique seu email",
    html: baseLayout(
      `
      <p>Olá, <strong>${data.name}</strong>!</p>
      <p>Para verificar seu endereço de email, clique no link abaixo:</p>
      <p style="text-align: center;"><a href="${data.verifyUrl}" class="btn">Verificar email</a></p>
      <p>Este link expira em <strong>${data.expiresIn ?? "24 horas"}</strong>.</p>
    `,
      data.appName as string,
    ),
  }),

  "account-locked": (data: TemplateData) => ({
    subject: "Conta bloqueada temporariamente",
    html: baseLayout(
      `
      <p>Olá, <strong>${data.name}</strong>!</p>
      <p>Sua conta foi bloqueada temporariamente devido a <strong>${data.attempts}</strong> tentativas de login malsucedidas.</p>
      <p>Você poderá tentar novamente em <strong>${data.lockDuration ?? "15 minutos"}</strong>.</p>
      <p>Se não foi você, recomendamos redefinir sua senha imediatamente.</p>
      ${data.resetUrl ? `<p style="text-align: center;"><a href="${data.resetUrl}" class="btn">Redefinir senha</a></p>` : ""}
    `,
      data.appName as string,
    ),
  }),
} satisfies Record<
  string,
  (data: TemplateData) => { subject: string; html: string }
>;

export type TemplateName = keyof typeof TEMPLATES;

/**
 * Render an email template with the given data.
 *
 * @example
 * ```ts
 * const { subject, html } = renderTemplate("password-reset", {
 *   name: "John",
 *   resetUrl: "https://app.example.com/reset?token=abc",
 * });
 *
 * await mail.send({ to: "john@example.com", subject, html });
 * ```
 */
export function renderTemplate(
  template: TemplateName,
  data: TemplateData,
): { subject: string; html: string } {
  const renderer = TEMPLATES[template];
  return renderer(data);
}
