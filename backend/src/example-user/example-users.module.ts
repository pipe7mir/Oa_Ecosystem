import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExampleUsersService } from './example-users.service';
import { ExampleUsersController } from './example-users.controller';
import { ExampleUser } from './example-user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ExampleUser])],
    controllers: [ExampleUsersController],
    providers: [ExampleUsersService],
})
export class ExampleUsersModule { }
