import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { RequestEntity } from './request.entity';
import { EmailModule } from '../email/email.module';
import { Setting } from '../settings-module/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity, Setting]), EmailModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
