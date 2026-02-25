import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Billboard } from './billboard.entity';
import { BillboardsController } from './billboards.controller';
import { AdminBillboardsController } from './billboards.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Billboard])],
  controllers: [BillboardsController, AdminBillboardsController],
})
export class BillboardsModule {}
