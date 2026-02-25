import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billboard } from './billboard.entity';

// Public GET /billboards
@Controller('billboards')
export class BillboardsController {
  constructor(
    @InjectRepository(Billboard)
    private readonly repo: Repository<Billboard>,
  ) {}

  @Get()
  async index() {
    return this.repo.find({ where: { isActive: true }, order: { order: 'ASC', createdAt: 'DESC' } });
  }
}
