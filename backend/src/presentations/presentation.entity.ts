import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Presentation Entity - Oasis Press Module
 * Stores presentation data as JSON for the slide editor
 */
@Entity('presentations')
export class Presentation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    thumbnail: string;

    @Column({ type: 'simple-json' })
    slides: SlideData[];

    @Column({ type: 'simple-json', nullable: true })
    settings: PresentationSettings;

    @Column({ default: 'draft' })
    status: 'draft' | 'published';

    @Column({ nullable: true })
    authorId: number;

    @Column({ nullable: true })
    authorName: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}

// Type definitions for the JSON structure
export interface SlideData {
    id: string;
    order: number;
    background: string;
    elements: SlideElement[];
    transition?: 'fade' | 'zoom' | 'slide' | 'morph';
    duration?: number;
}

export interface SlideElement {
    id: string;
    type: 'text' | 'image' | 'shape' | 'logo';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    content?: string;
    src?: string;
    style?: ElementStyle;
    layoutId?: string; // For Framer Motion morph animations
}

export interface ElementStyle {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    opacity?: number;
    textAlign?: 'left' | 'center' | 'right';
    padding?: number;
}

export interface PresentationSettings {
    aspectRatio: '16:9' | '4:3' | '9:16' | '1:1';
    defaultTransition: string;
    autoPlay?: boolean;
    loopSlides?: boolean;
    slideInterval?: number;
}
