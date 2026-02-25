import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventForm } from './event-form.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

// Admin resource: /admin/event-forms
@Controller('admin/event-forms')
@UseGuards(JwtAuthGuard)
export class AdminEventFormsController {
  constructor(
    @InjectRepository(EventForm)
    private readonly formsRepo: Repository<EventForm>,
  ) {}

  @Get()
  findAll() {
    return this.formsRepo.find({ order: { createdAt: 'DESC' } });
  }

  @Post()
  create(@Body() body: Partial<EventForm>) {
    const entity = this.formsRepo.create(body);
    return this.formsRepo.save(entity);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formsRepo.findOne({ where: { id } });
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<EventForm>) {
    return this.formsRepo.update(id, body);
  }

  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<EventForm>) {
    return this.formsRepo.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.formsRepo.delete(id);
    return { success: true };
  }
}
