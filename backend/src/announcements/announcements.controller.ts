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
    try {
      console.log('📝 Creating announcement with data:', JSON.stringify(data));
      return await this.announcementsService.create(data);
    } catch (error: any) {
      console.error('❌ Error in createAnnouncement controller:', error);
      throw error; // Let NestJS Global Exception Filter handle it
    }
  }

  @Post(':id')
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateAnnouncement(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any
  ) {
    try {
      console.log(`📝 Updating announcement ${id} with data:`, JSON.stringify(data));
      return await this.announcementsService.update(id, data);
    } catch (error: any) {
      console.error('❌ Error in updateAnnouncement controller:', error);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteAnnouncement(@Param('id', ParseIntPipe) id: number) {
    await this.announcementsService.remove(id);
    return { success: true };
  }
}
