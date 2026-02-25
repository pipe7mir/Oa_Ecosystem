import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './setting.entity';
import { SettingsController } from './settings.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Setting]), EmailModule],
  controllers: [SettingsController],
})
export class SettingsModule {}
