import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormSubmission } from './form-submission.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

// Admin routes: /admin/event-submissions
@Controller('admin/event-submissions')
@UseGuards(JwtAuthGuard)
export class AdminFormSubmissionsController {
  constructor(
    @InjectRepository(FormSubmission)
    private readonly repo: Repository<FormSubmission>,
  ) { }

  @Get()
  findAll() {
    return this.repo.find({ relations: ['eventForm'], order: { createdAt: 'DESC' } });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.repo.delete(id);
    return { success: true };
  }
}
