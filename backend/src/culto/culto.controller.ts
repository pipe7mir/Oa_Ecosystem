import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CultoService } from './culto.service';
import { CreateOrdenCultoDto } from './dto/create-orden-culto.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('orden-culto')
@UseGuards(JwtAuthGuard)
export class CultoController {
  constructor(private readonly service: CultoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateOrdenCultoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateOrdenCultoDto>) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Delete()
  clearAll() {
    return this.service.clearAll();
  }
}
