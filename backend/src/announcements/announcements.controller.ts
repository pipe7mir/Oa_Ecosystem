import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) { }

  @Get('debug/schema')
  async getDbSchema() {
    try {
      const columns = await this.announcementsService.getColumns();
      return { success: true, columns };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get()
  async getPublicAnnouncements() {
    return this.announcementsService.findAll();
  }

  // Upload image endpoint - saves base64 as file and returns URL
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  async uploadImage(@Body() body: { imageBase64: string }) {
    try {
      if (!body.imageBase64) {
        throw new HttpException('No image provided', HttpStatus.BAD_REQUEST);
      }

      // Extract base64 data (remove data:image/...;base64, prefix if present)
      const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate unique filename
      const filename = `ann-${Date.now()}.jpg`;
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      
      console.log(`📸 Image uploaded: ${filename} (${buffer.length} bytes)`);
      return { success: true, imageUrl: filename };
    } catch (error: any) {
      console.error('❌ Error uploading image:', error);
      throw new HttpException(error.message || 'Upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createAnnouncement(@Body() data: any) {
    try {
      // Log data size for debugging (truncate imageUrl if too long)
      const logData = { ...data };
      if (logData.imageUrl && logData.imageUrl.length > 100) {
        logData.imageUrl = `[base64 data: ${logData.imageUrl.length} chars]`;
      }
      console.log('📝 Creating announcement with data:', JSON.stringify(logData));
      
      return await this.announcementsService.create(data);
    } catch (error: any) {
      console.error('❌ Error in createAnnouncement controller:', error.message);
      throw new HttpException(
        error.message || 'Failed to create announcement',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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
