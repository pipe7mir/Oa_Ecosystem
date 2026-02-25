import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class AdminUserController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async index() {
        return this.usersService.findAll();
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.usersService.update(id, data);
    }

    @Patch(':id/approve')
    async approve(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.approve(id);
    }

    @Patch(':id/role')
    async updateRole(@Param('id', ParseIntPipe) id: number, @Body('role') role: string) {
        return this.usersService.updateRole(id, role);
    }

    @Delete(':id')
    async destroy(@Param('id', ParseIntPipe) id: number) {
        await this.usersService.remove(id);
        return { success: true };
    }
}
