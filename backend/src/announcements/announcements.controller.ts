import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) { }

  @Get()
  async getPublicAnnouncements() {
    return this.announcementsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createAnnouncement(@Body() data: any) {
    return this.announcementsService.create(data);
  }

  @Post(':id')
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateAnnouncement(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.announcementsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteAnnouncement(@Param('id', ParseIntPipe) id: number) {
    await this.announcementsService.remove(id);
    return { success: true };
  }
}
