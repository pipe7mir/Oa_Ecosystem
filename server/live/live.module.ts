import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveSetting } from './live-setting.entity';
import { LiveController } from './live.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LiveSetting])],
  controllers: [LiveController],
})
export class LiveModule {}
