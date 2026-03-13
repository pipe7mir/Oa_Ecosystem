import { Controller, Get } from '@nestjs/common';
import { CultoService } from './culto.service';

@Controller('public/orden-culto')
export class PublicCultoController {
  constructor(private readonly service: CultoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
