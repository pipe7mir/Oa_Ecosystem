import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardMember } from './board-member.entity';
import { GalleryItem } from './gallery-item.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller()
export class ManagementController {
  constructor(
    @InjectRepository(BoardMember) private readonly boardRepo: Repository<BoardMember>,
    @InjectRepository(GalleryItem) private readonly galleryRepo: Repository<GalleryItem>,
  ) {}

  // Public
  @Get('board-members')
  async indexBoardMembers() {
    return this.boardRepo.find({ order: { order: 'ASC', createdAt: 'DESC' } });
  }

  @Get('gallery-items')
  async indexGalleryItems() {
    return this.galleryRepo.find({ order: { order: 'ASC', createdAt: 'DESC' } });
  }

  // Admin
  @Post('board-members')
  @UseGuards(JwtAuthGuard)
  async storeBoardMember(@Body() body: Partial<BoardMember>) {
    const entity = this.boardRepo.create(body);
    return this.boardRepo.save(entity);
  }

  @Delete('board-members/:id')
  @UseGuards(JwtAuthGuard)
  async deleteBoardMember(@Param('id', ParseIntPipe) id: number) {
    await this.boardRepo.delete(id);
    return { success: true };
  }

  @Post('gallery-items')
  @UseGuards(JwtAuthGuard)
  async storeGalleryItem(@Body() body: Partial<GalleryItem>) {
    const entity = this.galleryRepo.create(body);
    return this.galleryRepo.save(entity);
  }

  @Delete('gallery-items/:id')
  @UseGuards(JwtAuthGuard)
  async deleteGalleryItem(@Param('id', ParseIntPipe) id: number) {
    await this.galleryRepo.delete(id);
    return { success: true };
  }
}
