import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ResultadoRegistrado, ResultadoVisita } from '../domain/resultado-visita.js';
import { type EstadoVisita, Visita } from '../domain/visita.js';
import type { VisitaRepository } from '../domain/visita.repository.js';
import { ResultadoVisitaOrmEntity } from './resultado-visita.orm-entity.js';
import { VisitaOrmEntity } from './visita.orm-entity.js';
import { VisitaResultadoOrmEntity } from './visita-resultado.orm-entity.js';

// Adaptador: implementa el puerto del dominio usando TypeORM + PostgreSQL.
@Injectable()
export class TypeOrmVisitaRepository implements VisitaRepository {
  constructor(
    @InjectRepository(VisitaOrmEntity) private readonly repo: Repository<VisitaOrmEntity>,
    @InjectRepository(ResultadoVisitaOrmEntity)
    private readonly resultados: Repository<ResultadoVisitaOrmEntity>,
    @InjectRepository(VisitaResultadoOrmEntity)
    private readonly visitaResultados: Repository<VisitaResultadoOrmEntity>,
  ) {}

  async guardar(visita: Visita): Promise<Visita> {
    const fila = await this.repo.save({
      id: visita.id ?? undefined,
      idCliente: visita.idCliente,
      idAsesor: visita.idAsesor,
      idRuta: visita.idRuta,
      fechaProgramada: visita.fechaProgramada,
      fechaReal: visita.fechaReal,
      estadoVisita: visita.estado,
      motivoReprogramacion: visita.motivoReprogramacion,
    });
    return this.aDominio(fila);
  }

  async listar(): Promise<Visita[]> {
    const filas = await this.repo.find({ order: { fechaProgramada: 'ASC' } });
    return filas.map((f) => this.aDominio(f));
  }

  async buscarPorId(id: number): Promise<Visita | null> {
    const fila = await this.repo.findOne({ where: { id } });
    return fila ? this.aDominio(fila) : null;
  }

  async listarResultadosCatalogo(): Promise<ResultadoVisita[]> {
    const filas = await this.resultados.find({ order: { nombre: 'ASC' } });
    return filas.map((f) => ({ id: f.id, nombre: f.nombre }));
  }

  async guardarResultadosVisita(
    idVisita: number,
    resultados: ResultadoRegistrado[],
  ): Promise<void> {
    // Al registrar un resultado nuevo se reemplazan los anteriores de la visita.
    await this.visitaResultados.delete({ idVisita });
    if (resultados.length === 0) return;
    await this.visitaResultados.save(
      resultados.map((r) => ({
        idVisita,
        idResultado: r.idResultado,
        observacion: r.observacion,
      })),
    );
  }

  private aDominio(fila: VisitaOrmEntity): Visita {
    return new Visita(
      fila.id,
      fila.idCliente,
      fila.idAsesor,
      fila.idRuta,
      fila.fechaProgramada,
      fila.estadoVisita as EstadoVisita,
      fila.fechaReal,
      fila.motivoReprogramacion,
    );
  }
}
