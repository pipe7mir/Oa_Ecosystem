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

  @Get('debug/schema')
  async checkSchema() {
    try {
      const res = await this.repo.query(`
        SELECT column_name, data_type, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_name = 'billboards'
      `);
      return res;
    } catch (e: any) {
      return { error: e.message };
    }
  }

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
      styles: item.styles || {},
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  private fromApiBillboard(body: any): Partial<Billboard> {
    const mediaUrl = body.mediaUrl || body.media_url || null;
    return {
      title: body.title || null,
      description: body.description || null,
      mediaUrl: mediaUrl,
      mediaType: body.mediaType || body.media_type || 'image',
      buttonText: body.buttonText || body.button_text || null,
      buttonLink: body.buttonLink || body.button_link || null,
      order: body.order || 0,
      isActive: body.isActive ?? body.is_active ?? true,
      styles: body.styles || null,
    };
  }

  @Get()
  async findAll() {
    const items = await this.repo.find({ order: { order: 'ASC', createdAt: 'DESC' } });
    return items.map((item) => this.toApiBillboard(item));
  }

  @Post()
  async create(@Body() body: any) {
    console.log('📝 Backend: Creating new billboard');
    const normalizedBody = this.fromApiBillboard(body);
    console.log('📸 Media URL to save:', normalizedBody.mediaUrl);
    try {
      const entity = this.repo.create(normalizedBody);
      const saved = await this.repo.save(entity);
      console.log('✅ Backend: Created billboard successfully, ID:', saved.id);
      return this.toApiBillboard(saved);
    } catch (error: any) {
      console.error('❌ Backend ERROR creating billboard:', error.message);
      console.error('Data attempted:', normalizedBody);
      throw error;
    }
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findOne({ where: { id } });
    return this.toApiBillboard(item);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    console.log(`📝 Backend: Updating billboard ${id}`);
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return this.toApiBillboard(null);
    const normalizedBody = this.fromApiBillboard(body);
    console.log('📸 Media URL to update:', normalizedBody.mediaUrl);
    Object.assign(existing, normalizedBody);
    try {
      const saved = await this.repo.save(existing);
      console.log('✅ Backend: Updated billboard successfully');
      return this.toApiBillboard(saved);
    } catch (error: any) {
      console.error('❌ Backend ERROR updating billboard:', error.message);
      throw error;
    }
  }

  @Patch(':id')
  async patch(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    console.log(`📝 Backend: Patching billboard ${id}`);
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return { success: false, message: 'Not found' };
    const normalizedBody = this.fromApiBillboard(body);
    console.log('📸 Media URL to patch:', normalizedBody.mediaUrl);
    Object.assign(existing, normalizedBody);
    try {
      const saved = await this.repo.save(existing);
      console.log('✅ Backend: Patched billboard successfully');
      return this.toApiBillboard(saved);
    } catch (error: any) {
      console.error('❌ Backend ERROR patching billboard:', error.message);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.repo.delete(id);
    return { success: true };
  }

  @Post('bulk-delete')
  async bulkDelete(@Body('ids') ids: number[]) {
    console.log(`📝 Backend: Bulk deleting billboards: ${ids}`);
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return { success: false, message: 'No IDs provided' };
    }
    await this.repo.delete(ids);
    return { success: true, deletedCount: ids.length };
  }
}
