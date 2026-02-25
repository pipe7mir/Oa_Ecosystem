import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { Setting } from '../settings-module/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
