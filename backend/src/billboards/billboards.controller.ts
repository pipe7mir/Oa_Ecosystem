import { Controller, Get, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billboard } from './billboard.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { v2 as cloudinary } from 'cloudinary';

// Public GET /billboards
@Controller('billboards')
export class BillboardsController {
  constructor(
    @InjectRepository(Billboard)
    private readonly repo: Repository<Billboard>,
  ) { }

  private toApiBillboard(item: Billboard) {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      media_url: item.mediaUrl,
      media_type: item.mediaType,
      button_text: item.buttonText,
      button_link: item.buttonLink,
      order: item.order,
      is_active: item.isActive,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  private configureCloudinary() {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config({
        secure: true,
      });
      return true;
    }

    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      return true;
    }

    return false;
  }

  @Get()
  async index() {
    const items = await this.repo.find({ where: { isActive: true }, order: { order: 'ASC', createdAt: 'DESC' } });
    return items.map((item) => this.toApiBillboard(item));
  }

  // Base64 image upload endpoint (JWT protected)
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  async uploadImage(@Body() body: any) {
    try {
      console.log('📥 Billboard upload request received');

      // Handle both { imageBase64: "..." } and raw string
      let imageBase64 = body?.imageBase64 || body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        console.error('❌ No valid image provided in body');
        throw new HttpException('No valid image provided', HttpStatus.BAD_REQUEST);
      }

      console.log(`📸 Billboard image size: ${(imageBase64.length / 1024).toFixed(1)}KB`);

      const cloudinaryConfigured = this.configureCloudinary();
      if (!cloudinaryConfigured) {
        throw new HttpException(
          'Cloudinary no está configurado en el servidor',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('☁️ Uploading billboard to Cloudinary...');
      const result = await cloudinary.uploader.upload(imageBase64, {
        folder: 'oasis-billboards',
        resource_type: 'image',
      });

      console.log(`✅ Cloudinary billboard upload success: ${result.secure_url}`);
      return { success: true, imageUrl: result.secure_url };
    } catch (error: any) {
      console.error('❌ Error in /billboards/upload-image:', error.message);
      throw new HttpException(
        error.message || 'Upload failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
