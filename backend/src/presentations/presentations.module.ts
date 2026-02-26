import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presentation } from './presentation.entity';
import { PresentationsService } from './presentations.service';
import { PresentationsController } from './presentations.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Presentation])],
    providers: [PresentationsService],
    controllers: [PresentationsController],
    exports: [PresentationsService],
})
export class PresentationsModule {}
