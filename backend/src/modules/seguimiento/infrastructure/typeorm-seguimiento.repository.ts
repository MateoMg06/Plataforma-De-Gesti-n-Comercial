import { Injectable, NotFoundException } from '@nestjs/common';
import { SEGUIMIENTO_REPOSITORY } from '../domain/seguimiento.repository.js';
import { Seguimiento } from '../domain/seguimiento.js';
import { SeguimientoOrmEntity } from '../infrastructure/seguimiento.orm-entity.js';
import { DataSource } from 'typeorm';

@Injectable()
export class TypeOrmSeguimientoRepository {
  constructor(private readonly dataSource: DataSource) {}

  async guardar(seguimiento: Seguimiento): Promise<Seguimiento> {
    const repo = this.dataSource.getRepository(SeguimientoOrmEntity);
    const entity = repo.create({
      id_visita: seguimiento.id_visita,
      fecha_proxima: seguimiento.fecha_proxima,
      actividad: seguimiento.actividad,
      observacion: seguimiento.observacion,
      completado: seguimiento.completado,
      fecha_completado: seguimiento.fecha_completado,
      completado_por: seguimiento.completado_por,
    });
    const saved = await repo.save(entity);
    return new Seguimiento(
      saved.id,
      saved.id_visita,
      saved.fecha_proxima,
      saved.actividad,
      saved.observacion,
      saved.completado,
      saved.fecha_completado,
      saved.completado_por,
    );
  }

  async listar(): Promise<Seguimiento[]> {
    const repo = this.dataSource.getRepository(SeguimientoOrmEntity);
    const entities = await repo.find({ order: { fecha_proxima: 'ASC' } });
    return entities.map((e) => new Seguimiento(
      e.id,
      e.id_visita,
      e.fecha_proxima,
      e.actividad,
      e.observacion,
      e.completado,
      e.fecha_completado,
      e.completado_por,
    ));
  }

  async buscarPorId(id: number): Promise<Seguimiento | null> {
    const repo = this.dataSource.getRepository(SeguimientoOrmEntity);
    const entity = await repo.findOne({ where: { id: id } });
    if (!entity) {
      return null;
    }
    return new Seguimiento(
      entity.id,
      entity.id_visita,
      entity.fecha_proxima,
      entity.actividad,
      entity.observacion,
      entity.completado,
      entity.fecha_completado,
      entity.completado_por,
    );
  }
}