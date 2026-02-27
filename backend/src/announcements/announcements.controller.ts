import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe, Res } from '@nestjs/common';
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
  async createAnnouncement(@Body() data: any, @Res() res: any) {
    try {
      const result = await this.announcementsService.create(data);
      return res.status(201).json(result);
    } catch (error: any) {
      console.error('❌ Error creating announcement:', error);
      return res.status(error.status || 400).json({
        success: false,
        message: 'Error al crear anuncio',
        error: error.message,
        stack: error.stack,
        receivedData: data
      });
    }
  }

  @Post(':id')
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateAnnouncement(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const result = await this.announcementsService.update(id, data);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Error updating announcement:', error);
      return res.status(error.status || 400).json({
        success: false,
        message: 'Error al actualizar anuncio',
        error: error.message,
        receivedData: data
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteAnnouncement(@Param('id', ParseIntPipe) id: number) {
    await this.announcementsService.remove(id);
    return { success: true };
  }
}
