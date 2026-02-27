import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Setting } from './setting.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { EmailService } from '../email/email.service';

@Controller()
export class SettingsController {
  constructor(
    @InjectRepository(Setting)
    private readonly repo: Repository<Setting>,
    private readonly emailService: EmailService,
  ) { }

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async index() {
    const all = await this.repo.find();
    const map: Record<string, string | null> = {};
    for (const s of all) {
      if (s.key === 'mail_password' && s.value) {
        map[s.key] = '••••••••';
      } else {
        map[s.key] = s.value;
      }
    }
    return map;
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard)
  async update(@Body() body: Record<string, string>) {
    for (const [key, value] of Object.entries(body)) {
      if (key === 'mail_password' && value.includes('•')) {
        continue;
      }
      let setting = await this.repo.findOne({ where: { key } });
      if (!setting) {
        setting = this.repo.create({ key, value });
      } else {
        setting.value = value;
      }
      await this.repo.save(setting);
    }
    return { success: true };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        // Use /tmp for Vercel, which is the only writable directory
        const dest = process.env.VERCEL ? '/tmp' : './uploads';
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        return { success: false, message: 'No file uploaded' };
      }
      return {
        filename: file.filename,
        url: `/uploads/${file.filename}`
      };
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      return { success: false, message: 'Upload failed', error: error.message };
    }
  }

  @Post('settings/test-email')
  @UseGuards(JwtAuthGuard)
  async testEmail() {
    const info = await this.emailService.testSmtp();
    return { success: true, message: info };
  }
}
