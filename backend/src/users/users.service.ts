import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) { }

    async onApplicationBootstrap() {
        const adminEmail = 'admin@oasis.com';
        const existing = await this.usersRepo.findOne({ where: { email: adminEmail } });
        if (!existing) {
            const admin = this.usersRepo.create({
                name: 'Admin Principal',
                username: 'admin',
                email: adminEmail,
                password: await bcrypt.hash('oasis123', 10),
                role: 'admin',
                isApproved: true,
            });
            await this.usersRepo.save(admin);
            console.log('✅ Auto-seeded admin user: admin@oasis.com / oasis123');
        }
    }

    async findAll(): Promise<User[]> {
        return this.usersRepo.find();
    }

    async findOne(id: number): Promise<User> {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(id: number, data: any): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, data);
        return this.usersRepo.save(user);
    }

    async approve(id: number): Promise<User> {
        const user = await this.findOne(id);
        user.isApproved = true;
        return this.usersRepo.save(user);
    }

    async disable(id: number): Promise<User> {
        const user = await this.findOne(id);
        user.isApproved = false;
        return this.usersRepo.save(user);
    }

    async toggleApproval(id: number): Promise<User> {
        const user = await this.findOne(id);
        user.isApproved = !user.isApproved;
        return this.usersRepo.save(user);
    }

    async updateRole(id: number, role: string): Promise<User> {
        const user = await this.findOne(id);
        user.role = role;
        return this.usersRepo.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        await this.usersRepo.remove(user);
    }
}
