import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

// Semua field create menjadi opsional untuk kebutuhan HTTP PATCH.
export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
