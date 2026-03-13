import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FormSubmission } from './form-submission.entity';

@Entity({ name: 'event_forms' })
export class EventForm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'simple-json' })
  fields: Record<string, any>;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 }) // 0 means unlimited
  capacity: number;

  @Column({ type: 'simple-json', nullable: true })
  styles: Record<string, any>;

  @OneToMany(() => FormSubmission, (submission) => submission.eventForm)
  submissions: FormSubmission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
