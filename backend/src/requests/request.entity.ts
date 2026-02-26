import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'requests' })
export class RequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'boolean', name: 'is_anonymous', default: false })
  isAnonymous: boolean;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  status: string;

  @Column({ type: 'text', nullable: true })
  response: string | null;

  @Column({ type: 'timestamptz', name: 'email_sent_at', nullable: true })
  emailSentAt: Date | null;

  @Column({ type: 'timestamptz', name: 'wa_link_opened_at', nullable: true })
  waLinkOpenedAt: Date | null;

  @Column({ type: 'varchar', length: 500, name: 'email_error', nullable: true })
  emailError: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
