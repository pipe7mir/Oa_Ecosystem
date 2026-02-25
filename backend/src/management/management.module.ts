import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementController } from './management.controller';
import { BoardMember } from './board-member.entity';
import { GalleryItem } from './gallery-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardMember, GalleryItem])],
  controllers: [ManagementController],
})
export class ManagementModule {}
