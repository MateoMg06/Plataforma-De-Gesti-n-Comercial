import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type EstadoVisita, Visita } from '../domain/visita.js';
import type { VisitaRepository } from '../domain/visita.repository.js';
import { VisitaOrmEntity } from './visita.orm-entity.js';

// Adaptador: implementa el puerto del dominio usando TypeORM + PostgreSQL.
@Injectable()
export class TypeOrmVisitaRepository implements VisitaRepository {
  constructor(
    @InjectRepository(VisitaOrmEntity) private readonly repo: Repository<VisitaOrmEntity>,
  ) {}

  async guardar(visita: Visita): Promise<Visita> {
    const fila = await this.repo.save({
      id: visita.id ?? undefined,
      idCliente: visita.idCliente,
      idAsesor: visita.idAsesor,
      idRuta: visita.idRuta,
      fechaProgramada: visita.fechaProgramada,
      estadoVisita: visita.estado,
    });
    return this.aDominio(fila);
  }

  async listar(): Promise<Visita[]> {
    const filas = await this.repo.find({ order: { fechaProgramada: 'ASC' } });
    return filas.map((f) => this.aDominio(f));
  }

  private aDominio(fila: VisitaOrmEntity): Visita {
    return new Visita(
      fila.id,
      fila.idCliente,
      fila.idAsesor,
      fila.idRuta,
      fila.fechaProgramada,
      fila.estadoVisita as EstadoVisita,
    );
  }
}
