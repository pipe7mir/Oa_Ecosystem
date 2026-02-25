import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExampleUser } from './example-user.entity';

@Injectable()
export class ExampleUsersService {
    constructor(
        @InjectRepository(ExampleUser)
        private readonly usersRepository: Repository<ExampleUser>,
    ) { }

    // Crear
    async create(userData: Partial<ExampleUser>): Promise<ExampleUser> {
        const newUser = this.usersRepository.create(userData);
        return this.usersRepository.save(newUser);
    }

    // Leer Todos
    async findAll(): Promise<ExampleUser[]> {
        return this.usersRepository.find();
    }

    // Leer Uno
    async findOne(id: number): Promise<ExampleUser> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return user;
    }

    // Actualizar
    async update(id: number, updateData: Partial<ExampleUser>): Promise<ExampleUser> {
        await this.usersRepository.update(id, updateData);
        return this.findOne(id);
    }

    // Eliminar
    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
    }
}
