import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenCulto } from './orden-culto.entity';
import { CreateOrdenCultoDto } from './dto/create-orden-culto.dto';

@Injectable()
export class CultoService {
  constructor(
    @InjectRepository(OrdenCulto)
    private readonly repo: Repository<OrdenCulto>,
  ) {}

  async findAll(): Promise<OrdenCulto[]> {
    return this.repo.find({ order: { hora: 'ASC' } });
  }

  async create(dto: CreateOrdenCultoDto): Promise<OrdenCulto> {
    const nuevo = this.repo.create(dto);
    return this.repo.save(nuevo);
  }

  async update(id: number, dto: Partial<CreateOrdenCultoDto>): Promise<OrdenCulto> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('No se encontró el item');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async clearAll(): Promise<void> {
    await this.repo.clear();
  }
}
