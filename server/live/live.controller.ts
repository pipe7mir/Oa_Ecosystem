import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveSetting } from './live-setting.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('live')
export class LiveController {
  constructor(
    @InjectRepository(LiveSetting)
    private readonly repo: Repository<LiveSetting>,
  ) {}

  @Get('settings')
  async index() {
    // Single row table; get first or create default
    const existing = await this.repo.find();
    return existing[0] ?? null;
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard)
  async update(@Body() body: Partial<LiveSetting>) {
    const existing = await this.repo.find();
    const current = existing[0] ?? this.repo.create();
    Object.assign(current, body);
    return this.repo.save(current);
  }
}
