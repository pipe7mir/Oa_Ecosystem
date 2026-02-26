import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EventForm } from './event-form.entity';

@Entity({ name: 'form_submissions' })
export class FormSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventForm, (form) => form.submissions, { onDelete: 'CASCADE' })
  eventForm: EventForm;

  @Column({ type: 'simple-json' })
  data: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
