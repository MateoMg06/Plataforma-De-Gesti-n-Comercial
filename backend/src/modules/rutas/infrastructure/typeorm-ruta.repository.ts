import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ruta } from '../domain/ruta.js';
import type { RutaRepository } from '../domain/ruta.repository.js';
import { RutaOrmEntity } from './ruta.orm-entity.js';

@Injectable()
export class TypeOrmRutaRepository implements RutaRepository {
  constructor(@InjectRepository(RutaOrmEntity) private readonly repo: Repository<RutaOrmEntity>) {}

  async guardar(ruta: Ruta): Promise<Ruta> {
    const fila = await this.repo.save({
      id: ruta.id ?? undefined,
      nombre: ruta.nombre,
      idAsesor: ruta.idAsesor,
      fechaInicio: ruta.fechaInicio,
      fechaFin: ruta.fechaFin,
      estado: ruta.estado,
    });
    return this.aDominio(fila);
  }

  private aDominio(fila: RutaOrmEntity): Ruta {
    return new Ruta(
      fila.id,
      fila.nombre,
      fila.idAsesor,
      fila.fechaInicio,
      fila.fechaFin,
      fila.estado,
    );
  }
}
