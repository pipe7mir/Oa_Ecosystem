import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Setting } from '../settings-module/setting.entity';

interface RequestLike {
  id: number;
  category: string;
  description: string;
  isAnonymous: boolean;
  name: string | null;
  phone: string | null;
  email: string | null;
}

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>,
  ) {}

  private async getSetting(key: string, defaultValue: string | null = null): Promise<string | null> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting || setting.value == null) return defaultValue;
    return setting.value;
  }

  private async getSmtpTransportAndMeta() {
    const destEmail = await this.getSetting('notify_email', '');
    const churchName = (await this.getSetting('church_name', 'Iglesia Oasis')) ?? 'Iglesia Oasis';

    if (!destEmail) {
      throw new UnprocessableEntityException('No hay correo destino configurado. Ve a Ajustes.');
    }

    const host = (await this.getSetting('mail_host', 'smtp.gmail.com')) ?? 'smtp.gmail.com';
    const portStr = (await this.getSetting('mail_port', '587')) ?? '587';
    const encryption = await this.getSetting('mail_encryption', 'tls');
    const username = await this.getSetting('mail_username', '');
    const password = await this.getSetting('mail_password', '');
    const fromName = (await this.getSetting('mail_from_name', churchName)) ?? churchName;
    const fromAddr = (await this.getSetting('mail_from_address', username)) ?? username;

    if (!username || !password) {
      throw new UnprocessableEntityException('Sin credenciales SMTP configuradas. Ve a Ajustes.');
    }

    const port = parseInt(portStr || '587', 10);
    const secure = encryption === 'ssl';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: username,
        pass: password,
      },
    });

    return { transporter, destEmail, churchName, fromName, fromAddr };
  }

  async sendNewRequestNotification(oasisRequest: RequestLike): Promise<string> {
    const { transporter, destEmail, churchName, fromName, fromAddr } =
      await this.getSmtpTransportAndMeta();

    const appUrl = process.env.APP_URL || process.env.FRONTEND_ORIGIN || 'https://tu-panel-admin';

    let body = `📩 Nueva Solicitud — ${churchName}\n\n`;
    body += `📋 Categoría: ${oasisRequest.category}\n`;
    body += `👤 Solicitante: ${
      oasisRequest.isAnonymous ? 'Anónimo' : oasisRequest.name ?? 'Sin nombre'
    }\n`;
    if (oasisRequest.phone && !oasisRequest.isAnonymous)
      body += `📞 Teléfono: ${oasisRequest.phone}\n`;
    if (oasisRequest.email && !oasisRequest.isAnonymous)
      body += `✉️  Email: ${oasisRequest.email}\n`;
    body += `\n📝 Descripción:\n${oasisRequest.description}\n\n`;
    body += `⏰ Recibido: ${new Date().toLocaleString('es-ES')}\n`;
    body += `🔗 Gestionalo en: ${appUrl}/admin/solicitudes`;

    await transporter.sendMail({
      from: `${fromName} <${fromAddr}>`,
      to: destEmail,
      subject: `[${churchName}] 🔔 Nueva Solicitud #${oasisRequest.id} — ${oasisRequest.category}`,
      text: body,
    });

    return `Notificación enviada a ${destEmail}`;
  }

  async resendRequestNotification(oasisRequest: RequestLike, notes?: string): Promise<string> {
    const { transporter, destEmail, churchName, fromName, fromAddr } =
      await this.getSmtpTransportAndMeta();

    let body = `📩 Nueva Solicitud — ${churchName}\n\n`;
    body += `Categoría: ${oasisRequest.category}\n`;
    body += `Solicitante: ${
      oasisRequest.isAnonymous ? 'Anónimo' : oasisRequest.name ?? 'Sin nombre'
    }\n`;
    body += `Teléfono: ${oasisRequest.phone ?? 'No provisto'}\n`;
    body += `Email: ${oasisRequest.email ?? 'No provisto'}\n\n`;
    body += `Descripción:\n${oasisRequest.description}\n`;
    if (notes) body += `\nNotas del admin:\n${notes}`;

    await transporter.sendMail({
      from: `${fromName} <${fromAddr}>`,
      to: destEmail,
      subject: `[${churchName}] Solicitud #${oasisRequest.id} — ${oasisRequest.category}`,
      text: body,
    });

    return `Correo enviado a ${destEmail}`;
  }

  async testSmtp(): Promise<string> {
    const { transporter, destEmail, churchName, fromName, fromAddr } =
      await this.getSmtpTransportAndMeta();

    await transporter.verify();

    await transporter.sendMail({
      from: `${fromName} <${fromAddr}>`,
      to: destEmail,
      subject: `[${churchName}] Prueba de configuración SMTP`,
      text: 'Este es un correo de prueba para verificar la configuración SMTP en Oasis.',
    });

    return `Prueba SMTP enviada a ${destEmail}`;
  }
}
