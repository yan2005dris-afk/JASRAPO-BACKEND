/**
 * Función utilitaria para escapar caracteres HTML peligrosos y prevenir XSS / HTML Injection.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  // Use String() explicitly to convert to string. For non-string scalars this
  // is the safest coercion (numbers, booleans, bigints). Plain objects would
  // become "[object Object]" but mail templates only pass scalar values.
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const str = typeof value === 'string' ? value : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface BaseTemplateContext {
  title?: string;
  body: string;
}

export function renderBaseTemplate(context: BaseTemplateContext): string {
  const title = escapeHtml(context.title ?? 'JASRAPO-Olon');
  return `<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f4f4f4;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
    }

    .header {
      background: #1a5276;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }

    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }

    .footer {
      background: #f4f4f4;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }

    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #1a5276;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>JASRAPO-Olon</h1>
      <p>Servicio de Agua Potable</p>
    </div>
    <div class="content">
      ${context.body}
    </div>
    <div class="footer">
      <p>JASRAPO-Olon — Servicio de Gestión de Agua</p>
      <p>Si tenés dudas, contactanos al administrative@jasrapo.com</p>
    </div>
  </div>
</body>

</html>`;
}

export interface PlanillaTemplateContext {
  nombre?: string;
  periodo?: string;
  fechaEmision?: string;
  montoTotal?: string | number;
}

export function renderPlanillaTemplate(
  context: PlanillaTemplateContext,
): string {
  const nombre = escapeHtml(context.nombre ?? '');
  const periodo = escapeHtml(context.periodo ?? '');
  const fechaEmision = escapeHtml(context.fechaEmision ?? '');
  const montoTotal = escapeHtml(context.montoTotal ?? '');

  return `<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planilla de Servicio de Agua</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f4f4f4;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
    }

    .header {
      background: #1a5276;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }

    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }

    .footer {
      background: #f4f4f4;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }

    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #1a5276;
      margin: 0;
    }

    .summary {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>JASRAPO-Olon</h1>
      <p>Servicio de Agua Potable</p>
    </div>
    <div class="content">
      <h2>Estimado/a ${nombre},</h2>

      <p>Le hacemos llegar la planilla correspondiente al período <strong>${periodo}</strong>.</p>

      <div class="summary">
        <p style="margin: 5px 0;"><strong>Período:</strong> ${periodo}</p>
        <p style="margin: 5px 0;"><strong>Fecha de emisión:</strong> ${fechaEmision}</p>
        <p style="margin: 10px 0 5px 0;">Monto a pagar:</p>
        <p class="amount">$${montoTotal}</p>
      </div>

      <p>Adjunto encontrará el comprobante en formato PDF con el detalle de su consumo.</p>

      <p>Le recordamos que puede realizar su pago en los puntos autorizados.</p>

      <p>Saludos cordiales,<br><strong>JASRAPO-Olon</strong></p>
    </div>
    <div class="footer">
      <p>JASRAPO-Olon — Servicio de Gestión de Agua</p>
      <p>Si tenés dudas, contactanos al administrative@jasrapo.com</p>
    </div>
  </div>
</body>

</html>`;
}

export interface GenericReportTemplateContext {
  subject?: string;
  reportType?: string;
}

export function renderGenericReportTemplate(
  context: GenericReportTemplateContext,
): string {
  const subject = escapeHtml(context.subject ?? '');
  const reportType = escapeHtml(context.reportType ?? '');

  return `<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f4f4f4;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
    }

    .header {
      background: #1a5276;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }

    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }

    .footer {
      background: #f4f4f4;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>JASRAPO-Olon</h1>
      <p>Servicio de Agua Potable</p>
    </div>
    <div class="content">
      <h2>${subject}</h2>
      <p>Adjunto encontrará el reporte correspondiente en formato PDF.</p>
      <p>Tipo de reporte: <strong>${reportType}</strong></p>
      <p>Saludos cordiales,<br><strong>JASRAPO-Olon</strong></p>
    </div>
    <div class="footer">
      <p>JASRAPO-Olon — Servicio de Gestión de Agua</p>
      <p>Si tenés dudas, contactanos al administrative@jasrapo.com</p>
    </div>
  </div>
</body>

</html>`;
}

export interface InvitationTemplateContext {
  nombres?: string;
  acceptUrl?: string;
  expiresInHours?: string | number;
}

export function renderInvitationTemplate(
  context: InvitationTemplateContext,
): string {
  const nombres = escapeHtml(context.nombres ?? '');
  const acceptUrl = escapeHtml(context.acceptUrl ?? '');
  const expiresInHours = escapeHtml(context.expiresInHours ?? 24);

  return `<h2>¡Bienvenido a JASRAPO-Olon!</h2>

<p>Hola ${nombres},</p>

<p>Hemos creado tu cuenta en JASRAPO-Olon. Para completar tu registro y establecer tu contraseña,
haz clic en el siguiente enlace:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="${acceptUrl}"
     style="background-color: #1a5276;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;">
    Completar mi registro
  </a>
</div>

<p><strong>Importante:</strong></p>
<ul>
  <li>Este enlace expira en ${expiresInHours} horas</li>
  <li>La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos</li>
  <li>Si no solicitaste esta invitación, ignora este mensaje</li>
</ul>

<p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
<p style="word-break: break-all; color: #0c9ea1;"><a href="${acceptUrl}" style="color: #0c9ea1;">${acceptUrl}</a></p>

<p>Si tienes problemas para acceder o no reconoces esta solicitud, contacta al equipo de administración.</p>

<p>Saludos,<br/>
El equipo de JASRAPO-Olon</p>`;
}

export const MAIL_TEMPLATES: Record<
  string,
  (context: Record<string, unknown>) => string
> = {
  base: (ctx) => renderBaseTemplate(ctx as unknown as BaseTemplateContext),
  planilla: (ctx) => renderPlanillaTemplate(ctx),
  'generic-report': (ctx) => renderGenericReportTemplate(ctx),
  invitation: (ctx) => renderInvitationTemplate(ctx),
};
