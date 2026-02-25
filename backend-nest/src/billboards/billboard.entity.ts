import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'billboards' })
export class Billboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, name: 'media_url', nullable: true })
  mediaUrl: string | null;

  @Column({ type: 'varchar', length: 50, name: 'media_type', default: 'image' })
  mediaType: 'image' | 'video';

  @Column({ type: 'varchar', length: 255, name: 'button_text', nullable: true })
  buttonText: string | null;

  @Column({ type: 'varchar', length: 255, name: 'button_link', nullable: true })
  buttonLink: string | null;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
