import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('announcements')
export class Announcement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    tag: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'datetime', name: 'event_date', nullable: true })
    eventDate: Date;

    @Column({ type: 'date', nullable: true })
    date: string;

    @Column({ type: 'varchar', name: 'image_url', length: 255, nullable: true })
    imageUrl: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
