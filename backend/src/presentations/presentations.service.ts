import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Presentation } from './presentation.entity';

@Injectable()
export class PresentationsService {
    constructor(
        @InjectRepository(Presentation)
        private readonly repo: Repository<Presentation>,
    ) {}

    async findAll(): Promise<Presentation[]> {
        return this.repo.find({ order: { updatedAt: 'DESC' } });
    }

    async findOne(id: number): Promise<Presentation> {
        const presentation = await this.repo.findOne({ where: { id } });
        if (!presentation) {
            throw new NotFoundException(`Presentation #${id} not found`);
        }
        return presentation;
    }

    async create(data: Partial<Presentation>): Promise<Presentation> {
        const presentation = this.repo.create({
            ...data,
            slides: data.slides || [{
                id: 'slide-1',
                order: 0,
                background: '#ffffff',
                elements: [],
                transition: 'morph'
            }],
            settings: data.settings || {
                aspectRatio: '16:9',
                defaultTransition: 'morph',
                autoPlay: false,
                loopSlides: false,
                slideInterval: 5000
            }
        });
        return this.repo.save(presentation);
    }

    async update(id: number, data: Partial<Presentation>): Promise<Presentation> {
        const presentation = await this.findOne(id);
        Object.assign(presentation, data);
        return this.repo.save(presentation);
    }

    async remove(id: number): Promise<void> {
        const presentation = await this.findOne(id);
        await this.repo.remove(presentation);
    }

    async duplicate(id: number): Promise<Presentation> {
        const original = await this.findOne(id);
        const copy = this.repo.create({
            ...original,
            id: undefined,
            title: `${original.title} (Copia)`,
            status: 'draft',
            createdAt: undefined,
            updatedAt: undefined,
        });
        return this.repo.save(copy);
    }
}
