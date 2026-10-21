import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../domain/pedido.js';
import type { PedidoRepository, FiltrosPedido } from '../domain/pedido.repository.js';
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
      fecha: pedido.fecha,
    });
    return new Pedido(fila.id, fila.numero, fila.idCotizacion, fila.idCliente, Number(fila.valor), fila.estado, fila.fecha);
  }

  async buscarPorId(id: number): Promise<Pedido | null> {
    const fila = await this.repo.findOneBy({ id });
    if (!fila) return null;
    return new Pedido(fila.id, fila.numero, fila.idCotizacion, fila.idCliente, Number(fila.valor), fila.estado, fila.fecha);
  }

  async buscarPorCotizacion(idCotizacion: number): Promise<Pedido | null> {
    const fila = await this.repo.findOneBy({ idCotizacion });
    if (!fila) return null;
    return new Pedido(fila.id, fila.numero, fila.idCotizacion, fila.idCliente, Number(fila.valor), fila.estado, fila.fecha);
  }

  async listar(filtros?: FiltrosPedido): Promise<Pedido[]> {
    const qb = this.repo.createQueryBuilder('p');
    if (filtros?.idCliente) qb.andWhere('p.idCliente = :idCliente', { idCliente: filtros.idCliente });
    if (filtros?.estado) qb.andWhere('p.estado = :estado', { estado: filtros.estado });
    if (filtros?.desde) qb.andWhere('p.fecha >= :desde', { desde: filtros.desde });
    if (filtros?.hasta) qb.andWhere('p.fecha <= :hasta', { hasta: filtros.hasta });
    const filas = await qb.getMany();
    return filas.map((f) => new Pedido(f.id, f.numero, f.idCotizacion, f.idCliente, Number(f.valor), f.estado, f.fecha));
  }

  async obtenerSiguienteNumero(): Promise<number> {
    const max = await this.repo.createQueryBuilder('p').select('COALESCE(MAX(p.numero), 0)', 'max').getRawOne();
    return Number(max.max) + 1;
  }
}
