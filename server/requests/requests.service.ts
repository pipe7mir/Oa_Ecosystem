import { Injectable, NotFoundException, UnprocessableEntityException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestEntity } from './request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AdminNotesDto } from './dto/admin-notes.dto';
import { EmailService } from '../email/email.service';
import { Setting } from '../settings-module/setting.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly repo: Repository<RequestEntity>,
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>,
    private readonly emailService: EmailService,
  ) {}

  private async getSetting(key: string, defaultValue: string | null = null): Promise<string | null> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting || setting.value == null) return defaultValue;
    return setting.value;
  }

  async findAll(): Promise<RequestEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateRequestDto) {
    const entity = this.repo.create({
      category: dto.category,
      description: dto.description,
      isAnonymous: dto.is_anonymous ?? false,
      name: dto.contact_name ?? null,
      phone: dto.contact_phone ?? null,
      email: dto.email ?? null,
      status: 'pendiente',
    });

    try {
      const saved = await this.repo.save(entity);

      let emailSent = false;
      let emailInfo = '';
      try {
        const info = await this.emailService.sendNewRequestNotification({
          id: saved.id,
          category: saved.category,
          description: saved.description,
          isAnonymous: saved.isAnonymous,
          name: saved.name,
          phone: saved.phone,
          email: saved.email,
        });
        saved.emailSentAt = new Date();
        saved.emailError = null;
        await this.repo.save(saved);
        emailSent = true;
        emailInfo = info;
      } catch (err) {
        const msg = (err as Error).message;
        saved.emailError = msg;
        await this.repo.save(saved);
        emailSent = false;
        emailInfo = msg;
      }

      return {
        success: true,
        message: 'Solicitud creada correctamente',
        data: saved,
        email_sent: emailSent,
        email_info: emailInfo,
      };
    } catch (e) {
      throw new InternalServerErrorException('Error al crear solicitud: ' + (e as Error).message);
    }
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');

    req.status = dto.status;
    if (dto.notes) {
      req.response = dto.notes;
    }
    await this.repo.save(req);

    return { success: true, data: req };
  }

  async approve(id: number, dto: AdminNotesDto) {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');

    req.status = 'gestionada';
    if (dto.response) req.response = dto.response;
    await this.repo.save(req);

    return { success: true, data: req };
  }

  async reject(id: number, dto: AdminNotesDto) {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');

    req.status = 'sin_respuesta';
    if (dto.response) req.response = dto.response;
    await this.repo.save(req);

    return { success: true, data: req };
  }

  async sendEmail(id: number, dto: AdminNotesDto) {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');

    try {
      const info = await this.emailService.resendRequestNotification(
        {
          id: req.id,
          category: req.category,
          description: req.description,
          isAnonymous: req.isAnonymous,
          name: req.name,
          phone: req.phone,
          email: req.email,
        },
        dto.notes,
      );
      req.emailSentAt = new Date();
      req.emailError = null;
      await this.repo.save(req);
      return { success: true, message: info };
    } catch (e) {
      const msg = (e as Error).message;
      req.emailError = msg;
      await this.repo.save(req);
      throw new UnprocessableEntityException('Error al enviar correo: ' + msg);
    }
  }

  async getWhatsappLink(id: number, dto: AdminNotesDto) {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');

    const churchName = (await this.getSetting('church_name', 'Iglesia Oasis')) ?? 'Iglesia Oasis';
    const waNumber = await this.getSetting('whatsapp_number', '');
    const waGroupLink = await this.getSetting('whatsapp_group_link', '');
    const notes = dto.notes ?? '';

    let text = `📋 *Solicitud #${req.id}* — ${churchName}\n`;
    text += `*Categoría:* ${req.category}\n`;
    text += `*Solicitante:* ${req.isAnonymous ? 'Anónimo' : req.name ?? 'Sin nombre'}\n`;
    if (req.phone && !req.isAnonymous) text += `*Teléfono:* ${req.phone}\n`;
    text += `\n*Descripción:*\n${req.description}`;
    if (notes) text += `\n\n*Nota:* ${notes}`;

    const encodedText = encodeURIComponent(text);

    let link: string;
    if (waNumber) {
      link = `https://wa.me/${waNumber}?text=${encodedText}`;
    } else if (waGroupLink) {
      // Group links don't support pre-filled text directly, return group link
      link = waGroupLink;
    } else {
      throw new UnprocessableEntityException(
        'No hay número ni grupo de WhatsApp configurado. Ve a Ajustes.',
      );
    }

    if (!req.waLinkOpenedAt) {
      req.waLinkOpenedAt = new Date();
      await this.repo.save(req);
    }

    return {
      success: true,
      link,
      message: text,
      has_number: Boolean(waNumber),
    };
  }
}
