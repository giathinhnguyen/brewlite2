import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { PromotionsModule } from '../promotions/promotions.module.js';
import { AdminGuard } from '../admin/admin.guard.js';

@Module({
  imports: [PromotionsModule],
  controllers: [OrdersController],
  providers: [OrdersService, AdminGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
