import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventForm } from './event-form.entity';
import { FormSubmission } from './form-submission.entity';
import { EventFormsController } from './event-forms.controller';
import { AdminEventFormsController } from './event-forms.admin.controller';
import { AdminFormSubmissionsController } from './form-submissions.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventForm, FormSubmission])],
  controllers: [
    EventFormsController,
    AdminEventFormsController,
    AdminFormSubmissionsController,
  ],
})
export class EventFormsModule {}
