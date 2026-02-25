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
        const announcement = this.announcementsRepo.create(data);
        // save debe recibir un solo objeto Announcement
        return await this.announcementsRepo.save(announcement);
    }

    async update(id: number, data: any): Promise<Announcement> {
        const announcement = await this.findOne(id);
        Object.assign(announcement, data);
        return await this.announcementsRepo.save(announcement);
    }

    async remove(id: number): Promise<void> {
        const announcement = await this.findOne(id);
        await this.announcementsRepo.remove(announcement);
    }
}
