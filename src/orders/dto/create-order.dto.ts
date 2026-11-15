import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { OrderStatus, ServiceType } from '../entities/order.entity';

export class CreateOrderDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  namaPelanggan!: string;

  @IsString()
  @Matches(/^(?:\+62|62|0)8[0-9]{8,11}$/, {
    message: 'nomorTelepon harus berupa nomor HP Indonesia yang valid',
  })
  nomorTelepon!: string;

  @IsIn(['Cuci Kering', 'Cuci Setrika', 'Setrika'])
  jenisLayanan!: ServiceType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  @Max(100)
  beratKg!: number;

  @IsDateString()
  tanggalMasuk!: string;

  @IsOptional()
  @IsIn(['Menunggu', 'Diproses', 'Selesai', 'Diambil'])
  status?: OrderStatus;

  @IsOptional()
  @IsDateString()
  tanggalSelesai?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  catatan?: string;
}
