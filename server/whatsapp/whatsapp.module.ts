import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from '../settings-module/setting.entity';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './services/whatsapp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule { }
