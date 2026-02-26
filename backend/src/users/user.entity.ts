import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'timestamp', name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, name: 'remember_token', nullable: true })
  rememberToken: string | null;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  role: string;

  @Column({ type: 'boolean', name: 'is_approved', default: false })
  isApproved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
