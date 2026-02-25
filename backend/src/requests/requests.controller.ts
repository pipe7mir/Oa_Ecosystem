import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AdminNotesDto } from './dto/admin-notes.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('requests')
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  // Public: create new request
  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.service.create(dto);
  }

  // Admin: list all requests
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  // Admin: update status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  // Admin: approve (legacy)
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminNotesDto,
  ) {
    return this.service.approve(id, dto);
  }

  // Admin: reject (legacy)
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminNotesDto,
  ) {
    return this.service.reject(id, dto);
  }

  // Admin: send email
  @Post(':id/send-email')
  @UseGuards(JwtAuthGuard)
  sendEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminNotesDto,
  ) {
    return this.service.sendEmail(id, dto);
  }

  // Admin: WhatsApp link
  @Get(':id/whatsapp-link')
  @UseGuards(JwtAuthGuard)
  getWhatsappLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminNotesDto,
  ) {
    return this.service.getWhatsappLink(id, dto);
  }
}
