import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'resources' })
export class ResourceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100, default: 'oasis' })
  category: string;

  @Column({ type: 'varchar', length: 255, name: 'download_url' })
  downloadUrl: string;

  @Column({ type: 'varchar', length: 255, name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', length: 50, name: 'action_type', default: 'download' })
  actionType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
