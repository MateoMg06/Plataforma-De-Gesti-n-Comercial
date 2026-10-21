import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../domain/pedido.js';
import type { PedidoRepository } from '../domain/pedido.repository.js';
import { PedidoOrmEntity } from './pedido.orm-entity.js';

@Injectable()
export class TypeOrmPedidoRepository implements PedidoRepository {
  constructor(@InjectRepository(PedidoOrmEntity) private readonly repo: Repository<PedidoOrmEntity>) {}

  async guardar(pedido: Pedido): Promise<Pedido> {
    const fila = await this.repo.save({
      numero: pedido.numero,
      idCotizacion: pedido.idCotizacion,
      idCliente: pedido.idCliente,
      valor: pedido.valor,
      estado: pedido.estado,
    });
    return new Pedido(fila.id, fila.numero, fila.idCotizacion, fila.idCliente, Number(fila.valor), fila.estado);
  }

  async buscarPorId(id: number): Promise<Pedido | null> {
    const fila = await this.repo.findOneBy({ id });
    if (!fila) return null;
    return new Pedido(fila.id, fila.numero, fila.idCotizacion, fila.idCliente, Number(fila.valor), fila.estado);
  }

  async obtenerSiguienteNumero(): Promise<number> {
    const max = await this.repo.createQueryBuilder('p').select('COALESCE(MAX(p.numero), 0)', 'max').getRawOne();
    return Number(max.max) + 1;
  }
}
