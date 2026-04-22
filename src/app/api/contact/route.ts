import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

/* Escape user input for safe inclusion in HTML email */
function esc(v: unknown): string {
  if (v === undefined || v === null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: Request) {
  try {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 },
      );
    }

    const {
      name,
      email,
      service,
      message,
      empresa,
      ubicacion,
      fecha,
      presupuesto,
      package: pkg,
    } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const subjectService = service || 'Sin tipo especificado';

    await transporter.sendMail({
      from: `Pablo Aerial <${user}>`,
      to: user,
      replyTo: email,
      subject: `[Uplink] ${subjectService} — ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; color: #0A0A0F;">
          <h2 style="margin:0 0 4px;font-size:18px;">Nuevo uplink — Yamamoto Aerial</h2>
          <p style="margin:0 0 20px;color:#666;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">OP-001 · formulario de contacto</p>

          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#666;width:160px;">Nombre</td><td style="padding:6px 0;"><strong>${esc(name)}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(email)}" style="color:#c3692d;">${esc(email)}</a></td></tr>
            ${empresa ? `<tr><td style="padding:6px 0;color:#666;">Empresa / Proyecto</td><td style="padding:6px 0;">${esc(empresa)}</td></tr>` : ''}
            <tr><td style="padding:6px 0;color:#666;">Tipo de proyecto</td><td style="padding:6px 0;">${esc(service || '—')}</td></tr>
            ${ubicacion ? `<tr><td style="padding:6px 0;color:#666;">Ubicación</td><td style="padding:6px 0;">${esc(ubicacion)}</td></tr>` : ''}
            ${fecha ? `<tr><td style="padding:6px 0;color:#666;">Fecha tentativa</td><td style="padding:6px 0;">${esc(fecha)}</td></tr>` : ''}
            ${presupuesto ? `<tr><td style="padding:6px 0;color:#666;">Presupuesto</td><td style="padding:6px 0;">${esc(presupuesto)}</td></tr>` : ''}
            ${pkg ? `<tr><td style="padding:6px 0;color:#666;">Paquete</td><td style="padding:6px 0;">${esc(pkg)}</td></tr>` : ''}
          </table>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

          <div style="font-size:12px;color:#666;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">Briefing</div>
          <p style="white-space: pre-line;font-size:14px;line-height:1.6;margin:0;">${esc(message)}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el mensaje' },
      { status: 500 },
    );
  }
}
