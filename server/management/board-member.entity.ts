import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'board_members' })
export class BoardMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  role: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, name: 'image_url', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 255, name: 'fullscreen_image_url', nullable: true })
  fullscreenImageUrl: string | null;

  @Column({ type: 'varchar', length: 50, default: 'individual' })
  type: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
