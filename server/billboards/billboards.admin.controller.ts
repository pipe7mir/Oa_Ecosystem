import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billboard } from './billboard.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

// Admin RESTful resource: /admin/billboards
@Controller('admin/billboards')
@UseGuards(JwtAuthGuard)
export class AdminBillboardsController {
  constructor(
    @InjectRepository(Billboard)
    private readonly repo: Repository<Billboard>,
  ) {}

  @Get()
  findAll() {
    return this.repo.find({ order: { order: 'ASC', createdAt: 'DESC' } });
  }

  @Post()
  create(@Body() body: Partial<Billboard>) {
    const entity = this.repo.create(body);
    return this.repo.save(entity);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repo.findOne({ where: { id } });
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<Billboard>) {
    return this.repo.update(id, body);
  }

  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<Billboard>) {
    return this.repo.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.repo.delete(id);
    return { success: true };
  }
}
