import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, ServiceType } from './entities/order.entity';

@Injectable()
export class OrdersService {
  // Sesuai instruksi tugas Bab 9: data sementara disimpan di memori.
  private readonly orders: Order[] = [];
  private sequence = 0;

  private readonly pricePerKg: Record<ServiceType, number> = {
    'Cuci Kering': 7000,
    'Cuci Setrika': 10000,
    Setrika: 5000,
  };

  private calculateTotal(jenisLayanan: ServiceType, beratKg: number): number {
    return Math.round(this.pricePerKg[jenisLayanan] * beratKg);
  }

  private isDuplicate(
    candidate: Pick<Order, 'nomorTelepon' | 'tanggalMasuk' | 'jenisLayanan' | 'beratKg'>,
    exceptId?: string,
  ): boolean {
    return this.orders.some(
      (order) =>
        order.id !== exceptId &&
        order.nomorTelepon === candidate.nomorTelepon &&
        order.tanggalMasuk.slice(0, 10) === candidate.tanggalMasuk.slice(0, 10) &&
        order.jenisLayanan === candidate.jenisLayanan &&
        order.beratKg === candidate.beratKg,
    );
  }

  create(dto: CreateOrderDto): Order {
    // Mencegah request yang sama terkirim dua kali tanpa sengaja.
    if (this.isDuplicate(dto)) {
      throw new ConflictException(
        'Pesanan serupa untuk pelanggan, tanggal, layanan, dan berat tersebut sudah ada.',
      );
    }

    this.sequence += 1;
    const now = new Date().toISOString();
    const order: Order = {
      id: randomUUID(),
      kodePesanan: `LDY-${String(this.sequence).padStart(4, '0')}`,
      namaPelanggan: dto.namaPelanggan,
      nomorTelepon: dto.nomorTelepon,
      jenisLayanan: dto.jenisLayanan,
      beratKg: dto.beratKg,
      status: dto.status ?? 'Menunggu',
      tanggalMasuk: dto.tanggalMasuk,
      tanggalSelesai: dto.tanggalSelesai,
      catatan: dto.catatan,
      totalHarga: this.calculateTotal(dto.jenisLayanan, dto.beratKg),
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(order);
    return order;
  }

  findAll(): Order[] {
    return [...this.orders];
  }

  findOne(id: string): Order {
    const order = this.orders.find((item) => item.id === id);
    if (!order) {
      throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan.`);
    }
    return order;
  }

  update(id: string, dto: UpdateOrderDto): Order {
    const order = this.findOne(id);
    const updated = { ...order, ...dto };

    if (this.isDuplicate(updated, id)) {
      throw new ConflictException(
        'Perubahan menghasilkan pesanan serupa dengan pesanan lain yang sudah ada.',
      );
    }

    Object.assign(order, dto, {
      totalHarga: this.calculateTotal(updated.jenisLayanan, updated.beratKg),
      updatedAt: new Date().toISOString(),
    });

    return order;
  }

  remove(id: string): void {
    const index = this.orders.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan.`);
    }
    this.orders.splice(index, 1);
  }
}
