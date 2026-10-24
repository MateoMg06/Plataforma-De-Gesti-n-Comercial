import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { BitacoraRepository } from '../domain/bitacora.repository.js';
import { type FiltrosBitacora, RegistroBitacora } from '../domain/registro-bitacora.js';
import { BitacoraOrmEntity } from './bitacora.orm-entity.js';

// Adaptador: implementa el puerto con TypeORM y traduce ORM → dominio.
@Injectable()
export class TypeOrmBitacoraRepository implements BitacoraRepository {
  constructor(
    @InjectRepository(BitacoraOrmEntity)
    private readonly repo: Repository<BitacoraOrmEntity>,
  ) {}

  async consultar(filtros: FiltrosBitacora): Promise<RegistroBitacora[]> {
    // Cada filtro se agrega solo si viene; así se pueden combinar.
    const consulta = this.repo.createQueryBuilder('b').orderBy('b.fecha', 'DESC');
    if (filtros.usuarioId) consulta.andWhere('b.usuario_id = :usuarioId', { usuarioId: filtros.usuarioId });
    if (filtros.accion) consulta.andWhere('b.accion = :accion', { accion: filtros.accion });
    if (filtros.desde) consulta.andWhere('b.fecha >= :desde', { desde: filtros.desde });
    if (filtros.hasta) consulta.andWhere('b.fecha < :hasta', { hasta: filtros.hasta });

    const filas = await consulta.getMany();
    return filas.map(
      (f) => new RegistroBitacora(f.id, f.usuario_id, f.usuario_nombre, f.accion, f.modulo, f.fecha, f.detalle),
    );
  }
}
