import { Body, Controller, Get, Post, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { WhatsappService } from './services/whatsapp.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from '../settings-module/setting.entity';
import { Repository } from 'typeorm';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly waService: WhatsappService,
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>,
  ) { }

  private async getSetting(key: string, defaultValue = ''): Promise<string> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    return setting?.value ?? defaultValue;
  }

  private async setSetting(key: string, value: string): Promise<void> {
    let setting = await this.settingsRepo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
    } else {
      setting = this.settingsRepo.create({ key, value });
    }
    await this.settingsRepo.save(setting);
  }

  @Post('webhook')
  async webhook(@Body() body: any) {
    const { event, data } = body;

    switch (event) {
      case 'CONNECTION_UPDATE':
        await this.handleConnectionUpdate(data);
        break;
      case 'QRCODE_UPDATED':
        const qrBase64 = data.qrcode?.base64;
        if (qrBase64) {
          await this.setSetting('wa_qr_code', qrBase64);
          await this.setSetting('wa_status', 'qr_pending');
        }
        break;
    }
    return { received: true };
  }

  private async handleConnectionUpdate(data: any) {
    const state = data.state;
    const statusReason = data.statusReason;

    if (statusReason === 401) {
      await this.activateKillSwitch('🚫 NÚMERO BANEADO por WhatsApp (código 401). Envíos detenidos.');
    } else if (state === 'close' && statusReason !== 200) {
      await this.activateKillSwitch(`⚠️ Sesión cerrada inesperadamente (reason: ${statusReason}).`);
    } else if (state === 'open') {
      await this.deactivateKillSwitch();
    } else if (state === 'connecting') {
      await this.setSetting('wa_status', 'connecting');
    }
  }

  private async activateKillSwitch(reason: string) {
    await this.setSetting('wa_kill_switch', '1');
    await this.setSetting('wa_kill_reason', reason);
    await this.setSetting('wa_status', 'banned_or_disconnected');
  }

  private async deactivateKillSwitch() {
    await this.setSetting('wa_kill_switch', '0');
    await this.setSetting('wa_kill_reason', '');
    await this.setSetting('wa_status', 'connected');
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async status() {
    const killSwitch = (await this.getSetting('wa_kill_switch', '0')) === '1';
    const waStatus = await this.getSetting('wa_status', 'unknown');
    const killReason = await this.getSetting('wa_kill_reason', '');
    const qr = await this.getSetting('wa_qr_code', '');

    let liveState = 'unknown';
    try {
      const apiStatus = await this.waService.getInstanceStatus();
      liveState = apiStatus.instance?.state ?? 'unknown';
    } catch (e) {
      liveState = 'api_unreachable';
    }

    return {
      kill_switch: killSwitch,
      kill_reason: killReason,
      status: waStatus,
      live_state: liveState,
      has_qr: !!qr,
      qr_base64: qr,
    };
  }

  @Post('create-instance')
  @UseGuards(JwtAuthGuard)
  async createInstance() {
    // Note: Replicating Laravel behavior where it uses the default webhook URL defined in env or settings
    const webhookUrl = await this.getSetting('app_url', '') + '/api/whatsapp/webhook';
    const result = await this.waService.createInstance(webhookUrl);
    await this.setSetting('wa_status', 'created');
    return { success: true, data: result };
  }

  @Get('qr')
  @UseGuards(JwtAuthGuard)
  async getQr() {
    const result = await this.waService.getQrCode();
    return { success: true, data: result };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    await this.waService.logoutInstance();
    await this.setSetting('wa_status', 'disconnected');
    await this.setSetting('wa_qr_code', '');
    return { success: true, message: 'Instancia desconectada' };
  }

  @Post('reset-kill-switch')
  @UseGuards(JwtAuthGuard)
  async resetKillSwitch() {
    await this.deactivateKillSwitch();
    return { success: true, message: 'Kill-switch desactivado. Los envíos se reanudan.' };
  }

  @Post('send-test')
  @UseGuards(JwtAuthGuard)
  async sendTest(@Body() body: { to: string; message: string }) {
    if ((await this.getSetting('wa_kill_switch', '0')) === '1') {
      throw new ForbiddenException({
        success: false,
        message: 'Kill-switch activo: ' + (await this.getSetting('wa_kill_reason')),
      });
    }
    const result = await this.waService.sendText(body.to, body.message, 1, 3);
    return { success: true, data: result };
  }

  @Post('send-document')
  @UseGuards(JwtAuthGuard)
  async sendDocument(@Body() body: { to: string; file_url: string; caption?: string; file_name?: string }) {
    if ((await this.getSetting('wa_kill_switch', '0')) === '1') {
      throw new ForbiddenException({
        success: false,
        message: 'Kill-switch activo: ' + (await this.getSetting('wa_kill_reason')),
      });
    }
    const result = await this.waService.sendDocument(
      body.to,
      body.file_url,
      body.caption,
      body.file_name,
      5,
      15,
    );
    return { success: true, data: result };
  }
}
