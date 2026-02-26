import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { PresentationsService } from './presentations.service';
import { Presentation } from './presentation.entity';

@Controller('presentations')
export class PresentationsController {
    constructor(private readonly service: PresentationsService) {}

    // Public: Get all published presentations
    @Get()
    findAll(): Promise<Presentation[]> {
        return this.service.findAll();
    }

    // Public: Get single presentation
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Presentation> {
        return this.service.findOne(id);
    }

    // Protected: Create presentation
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() data: Partial<Presentation>): Promise<Presentation> {
        return this.service.create(data);
    }

    // Protected: Update presentation
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: Partial<Presentation>,
    ): Promise<Presentation> {
        return this.service.update(id, data);
    }

    // Protected: Delete presentation
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
        await this.service.remove(id);
        return { success: true };
    }

    // Protected: Duplicate presentation
    @Post(':id/duplicate')
    @UseGuards(JwtAuthGuard)
    duplicate(@Param('id', ParseIntPipe) id: number): Promise<Presentation> {
        return this.service.duplicate(id);
    }
}
