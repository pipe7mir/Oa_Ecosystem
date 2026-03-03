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

  private toApiBillboard(item: Billboard | null) {
    if (!item) return null;
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      media_url: item.mediaUrl,
      media_type: item.mediaType,
      button_text: item.buttonText,
      button_link: item.buttonLink,
      order: item.order,
      is_active: item.isActive,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  private fromApiBillboard(body: Partial<Billboard> & Record<string, any>): Partial<Billboard> {
    return {
      title: body.title ?? null,
      description: body.description ?? null,
      mediaUrl: body.mediaUrl ?? body.media_url ?? null,
      mediaType: body.mediaType ?? body.media_type ?? 'image',
      buttonText: body.buttonText ?? body.button_text ?? null,
      buttonLink: body.buttonLink ?? body.button_link ?? null,
      order: body.order ?? 0,
      isActive: body.isActive ?? body.is_active ?? true,
    };
  }

  @Get()
  async findAll() {
    const items = await this.repo.find({ order: { order: 'ASC', createdAt: 'DESC' } });
    return items.map((item) => this.toApiBillboard(item));
  }

  @Post()
  async create(@Body() body: Partial<Billboard> & Record<string, any>) {
    const normalizedBody = this.fromApiBillboard(body);
    const entity = this.repo.create(normalizedBody);
    return this.repo.save(entity);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findOne({ where: { id } });
    return this.toApiBillboard(item);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<Billboard> & Record<string, any>) {
    const normalizedBody = this.fromApiBillboard(body);
    return this.repo.update(id, normalizedBody);
  }

  @Patch(':id')
  async patch(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<Billboard> & Record<string, any>) {
    const normalizedBody = this.fromApiBillboard(body);
    return this.repo.update(id, normalizedBody);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.repo.delete(id);
    return { success: true };
  }
}
