import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceEntity } from './resource.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('resources')
export class ResourcesController {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly repo: Repository<ResourceEntity>,
  ) {}

  // Public
  @Get()
  async index() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  // Admin
  @Post()
  @UseGuards(JwtAuthGuard)
  async store(@Body() body: Partial<ResourceEntity>) {
    const entity = this.repo.create(body);
    return this.repo.save(entity);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<ResourceEntity>,
  ) {
    await this.repo.update(id, body);
    return this.repo.findOne({ where: { id } });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async destroy(@Param('id', ParseIntPipe) id: number) {
    await this.repo.delete(id);
    return { success: true };
  }
}
