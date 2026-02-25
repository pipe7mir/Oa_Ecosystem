import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventForm } from './event-form.entity';
import { FormSubmission } from './form-submission.entity';

// Public routes: /event-forms, /event-forms/:id, /event-submissions
@Controller()
export class EventFormsController {
  constructor(
    @InjectRepository(EventForm) private readonly formsRepo: Repository<EventForm>,
    @InjectRepository(FormSubmission)
    private readonly submissionsRepo: Repository<FormSubmission>,
  ) {}

  @Get('event-forms')
  async index() {
    return this.formsRepo.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });
  }

  @Get('event-forms/:id')
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.formsRepo.findOne({ where: { id } });
  }

  @Post('event-submissions')
  async storeSubmission(@Body() body: { event_form_id: number; data: any }) {
    const form = await this.formsRepo.findOne({ where: { id: body.event_form_id } });
    if (!form) return { success: false, message: 'Form not found' };

    const entity = this.submissionsRepo.create({ eventForm: form, data: body.data });
    const saved = await this.submissionsRepo.save(entity);
    return { success: true, data: saved };
  }
}
