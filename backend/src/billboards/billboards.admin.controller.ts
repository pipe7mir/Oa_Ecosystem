import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billboard } from './billboard.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if CLOUDINARY_URL is set
if (process.env.CLOUDINARY_URL) {
  console.log('☁️ Cloudinary configured for billboards');
} else {
  console.log('⚠️ CLOUDINARY_URL not set, billboards will use local storage');
}

// Admin RESTful resource: /admin/billboards
@Controller('admin/billboards')
@UseGuards(JwtAuthGuard)
export class AdminBillboardsController {
  constructor(
    @InjectRepository(Billboard)
    private readonly repo: Repository<Billboard>,
  ) {}

  // Upload image endpoint - uses Cloudinary if configured, else saves locally
  @Post('upload-image')
  async uploadImage(@Body() body: any) {
    try {
      console.log('📥 Billboard upload request received');
      
      // Handle both { imageBase64: "..." } and raw string
      let imageBase64 = body?.imageBase64 || body;
      
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        console.error('❌ Invalid image data for billboard');
        throw new HttpException('No valid image provided', HttpStatus.BAD_REQUEST);
      }
      
      console.log('📸 Billboard image size:', (imageBase64.length / 1024).toFixed(1) + 'KB');
      
      // Try Cloudinary first if configured
      if (process.env.CLOUDINARY_URL) {
        try {
          console.log('☁️ Uploading billboard to Cloudinary...');
          const result = await cloudinary.uploader.upload(imageBase64, {
            folder: 'oasis-billboards',
            resource_type: 'image',
            transformation: [
              { width: 1920, height: 1080, crop: 'limit', quality: 'auto:best' }
            ]
          });
          console.log(`✅ Cloudinary billboard upload success: ${result.secure_url}`);
          return { success: true, imageUrl: result.secure_url };
        } catch (cloudErr: any) {
          console.error('⚠️ Cloudinary upload failed, falling back to local:', cloudErr.message);
        }
      }

      // Fallback: save locally
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `billboard-${Date.now()}.jpg`;
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      console.log(`📸 Local billboard upload: ${filename} (${buffer.length} bytes)`);
      
      // Return full URL
      const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      const fullUrl = `${apiBaseUrl}/uploads/${filename}`;
      console.log(`✅ Local billboard saved, returning URL: ${fullUrl}`);
      
      return { success: true, imageUrl: fullUrl };
    } catch (error: any) {
      console.error('❌ Error uploading billboard image:', error);
      throw new HttpException(error.message || 'Upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  findAll() {
    return this.repo.find({ order: { order: 'ASC', createdAt: 'DESC' } });
  }

  @Post()
  create(@Body() body: Partial<Billboard>) {
    const entity = this.repo.create(body);
    return this.repo.save(entity);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repo.findOne({ where: { id } });
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<Billboard>) {
    return this.repo.update(id, body);
  }

  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<Billboard>) {
    return this.repo.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.repo.delete(id);
    return { success: true };
  }
}
