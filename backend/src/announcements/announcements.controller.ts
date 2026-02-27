import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if CLOUDINARY_URL is set
if (process.env.CLOUDINARY_URL) {
  console.log('☁️ Cloudinary configured for image storage');
}

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

  // Upload image endpoint - uses Cloudinary if configured, else saves locally
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  async uploadImage(@Body() body: { imageBase64: string }) {
    try {
      if (!body.imageBase64) {
        throw new HttpException('No image provided', HttpStatus.BAD_REQUEST);
      }

      const imageBase64 = body.imageBase64;
      
      // Try Cloudinary first if configured
      if (process.env.CLOUDINARY_URL) {
        try {
          console.log('☁️ Uploading to Cloudinary...');
          const result = await cloudinary.uploader.upload(imageBase64, {
            folder: 'oasis-announcements',
            resource_type: 'image',
          });
          console.log(`✅ Cloudinary upload success: ${result.secure_url}`);
          return { success: true, imageUrl: result.secure_url };
        } catch (cloudErr: any) {
          console.error('⚠️ Cloudinary upload failed, falling back to local:', cloudErr.message);
        }
      }

      // Fallback: save locally (note: Railway doesn't persist files across deploys)
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `ann-${Date.now()}.jpg`;
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
      console.log(`📸 Local upload: ${filename} (${buffer.length} bytes)`);
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
