import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) { }

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
