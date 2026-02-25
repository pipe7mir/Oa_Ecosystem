import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ExampleUsersService } from './example-users.service';
import { ExampleUser } from './example-user.entity';

@Controller('example-users')
export class ExampleUsersController {
    constructor(private readonly usersService: ExampleUsersService) { }

    @Post()
    create(@Body() createUserDto: Partial<ExampleUser>) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: Partial<ExampleUser>) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}
