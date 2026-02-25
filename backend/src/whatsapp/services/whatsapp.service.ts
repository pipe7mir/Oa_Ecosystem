import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../settings-module/setting.entity';

export interface EvolutionResponse<T = any> {
  success?: boolean;
  [key: string]: any;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private baseUrl: string;
  private apiKey: string;
  private instanceName: string;

  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>,
  ) { }

  private async getSetting(key: string, defaultValue = ''): Promise<string> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    return setting?.value ?? defaultValue;
  }

  private async ensureConfigLoaded() {
    if (!this.baseUrl) {
      this.baseUrl = (await this.getSetting('evolution_url', ''))?.replace(/\/+$/, '');
      this.apiKey = await this.getSetting('evolution_key', '');
      this.instanceName = await this.getSetting('evolution_instance', 'oasis-iglesia');
    }
  }

  /* HTTP helpers */
  private async get<T = any>(path: string): Promise<EvolutionResponse<T>> {
    await this.ensureConfigLoaded();
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GET ${url} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as EvolutionResponse<T>;
  }

  private async post<T = any>(path: string, body: any): Promise<EvolutionResponse<T>> {
    await this.ensureConfigLoaded();
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST ${url} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as EvolutionResponse<T>;
  }

  private async delete<T = any>(path: string): Promise<EvolutionResponse<T>> {
    await this.ensureConfigLoaded();
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`DELETE ${url} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as EvolutionResponse<T>;
  }

  /* Instance management */
  async createInstance(webhookUrl: string): Promise<any> {
    const payload = {
      instanceName: this.instanceName,
      token: '',
      qrcode: true,
      browserAgent: {
        browser: 'Chrome',
        version: '122.0.0.0',
        platform: 'Windows',
      },
      user_agent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      reject_call: true,
      msg_call:
        '\ud83d\udcf5 Hola, no podemos atender llamadas por este nmero. Por favor escrdbenos.',
      groups_ignore: true,
      always_online: false,
      read_messages: false,
      read_status: false,
      webhook: {
        url: webhookUrl,
        enabled: true,
        events: [
          'APPLICATION_STARTUP',
          'QRCODE_UPDATED',
          'MESSAGES_SET',
          'MESSAGES_UPSERT',
          'CONNECTION_UPDATE',
        ],
      },
    };

    return this.post('/instance/create', payload);
  }

  async getInstanceStatus(): Promise<any> {
    return this.get(`/instance/connectionState/${this.instanceName}`);
  }

  async getQrCode(): Promise<any> {
    return this.get(`/instance/connect/${this.instanceName}`);
  }

  async logoutInstance(): Promise<any> {
    return this.delete(`/instance/logout/${this.instanceName}`);
  }

  async isConnected(): Promise<boolean> {
    try {
      const status = await this.getInstanceStatus();
      return (status.instance?.state ?? '') === 'open';
    } catch (e: any) {
      this.logger.warn(`WhatsApp: unable to check instance status: ${e.message}`);
      return false;
    }
  }

  /* Messaging with humanization */
  private normalizeNumber(number: string): string {
    const clean = number.replace(/\D/g, '');
    return `${clean}@s.whatsapp.net`;
  }

  private async sendPresence(to: string, type: 'composing' | 'recording' | 'paused', seconds = 3) {
    try {
      await this.post(`/chat/sendPresence/${this.instanceName}`, {
        number: this.normalizeNumber(to),
        options: { presence: type, delay: seconds * 1000 },
      });
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    } catch (e: any) {
      this.logger.warn(`WhatsApp: failed to send presence: ${e.message}`);
    }
  }

  async sendText(to: string, message: string, minDelay = 15, maxDelay = 45) {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    this.logger.log(`WhatsApp: waiting ${delay}s before sending to ${to}`);
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));

    await this.sendPresence(to, 'composing', 3);

    const payload = {
      number: this.normalizeNumber(to),
      options: {
        delay: 1500,
        presence: 'composing',
      },
      textMessage: { text: message },
    };

    const result = await this.post(`/message/sendText/${this.instanceName}`, payload);
    this.logger.log(`WhatsApp: message sent to ${to}`);
    return result;
  }

  async sendDocument(
    to: string,
    fileUrl: string,
    caption = '',
    fileName = 'documento.pdf',
    minDelay = 10,
    maxDelay = 30,
  ) {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));

    await this.sendPresence(to, 'recording', 2);

    const payload = {
      number: this.normalizeNumber(to),
      options: { delay: 1200 },
      mediaMessage: {
        mediatype: 'document',
        media: fileUrl,
        fileName,
        caption,
      },
    };

    const result = await this.post(`/message/sendMedia/${this.instanceName}`, payload);
    this.logger.log(`WhatsApp: document sent to ${to}`);
    return result;
  }
}
