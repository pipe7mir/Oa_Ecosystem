import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './announcement.entity';

@Injectable()
export class AnnouncementsService {
    constructor(
        @InjectRepository(Announcement)
        private readonly announcementsRepo: Repository<Announcement>,
    ) { }

    async findAll(): Promise<Announcement[]> {
        return this.announcementsRepo.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Announcement> {
        const announcement = await this.announcementsRepo.findOne({ where: { id } });
        if (!announcement) {
            throw new NotFoundException(`Announcement with ID ${id} not found`);
        }
        return announcement;
    }

    async create(data: Partial<Announcement>): Promise<Announcement> {
        try {
            // Keep date as string but handle empty string
            if (data.date === '' || (typeof data.date === 'string' && !data.date.trim())) {
                data.date = undefined; // Use undefined for string properties in TypeORM
            }

            const announcement = this.announcementsRepo.create(data);
            return await this.announcementsRepo.save(announcement);
        } catch (error: any) {
            console.error('❌ Database error in create:', error);
            throw error;
        }
    }

    async update(id: number, data: any): Promise<Announcement> {
        try {
            const announcement = await this.findOne(id);
            if (!announcement) throw new Error('Anuncio no encontrado');

            // Handle empty date string
            if (data.date === '' || (typeof data.date === 'string' && !data.date.trim())) {
                data.date = undefined;
            }

            Object.assign(announcement, data);
            return await this.announcementsRepo.save(announcement);
        } catch (error: any) {
            console.error('❌ Database error in update:', error);
            throw error;
        }
    }

    async remove(id: number): Promise<void> {
        const announcement = await this.findOne(id);
        await this.announcementsRepo.remove(announcement);
    }
}
