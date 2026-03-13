import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenCulto } from './orden-culto.entity';
import { CultoService } from './culto.service';
import { CultoController } from './culto.controller';
import { PublicCultoController } from './public-culto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrdenCulto])],
  controllers: [CultoController, PublicCultoController],
  providers: [CultoService],
  exports: [CultoService],
})
export class CultoModule {}
