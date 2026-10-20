import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zona } from '../domain/zona.js';
import type { ZonaRepository } from '../domain/zona.repository.js';
import { ZonaOrmEntity } from './zona.orm-entity.js';

// Adaptador: implementa el puerto del dominio usando TypeORM + PostgreSQL.
@Injectable()
export class TypeOrmZonaRepository implements ZonaRepository {
  constructor(@InjectRepository(ZonaOrmEntity) private readonly repo: Repository<ZonaOrmEntity>) {}

  async guardar(zona: Zona): Promise<Zona> {
    const fila = await this.repo.save({ id: zona.id ?? undefined, nombre: zona.nombre });
    return this.aDominio(fila);
  }

  async listar(): Promise<Zona[]> {
    const filas = await this.repo.find({ order: { nombre: 'ASC' } });
    return filas.map((f) => this.aDominio(f));
  }

  async buscarPorNombre(nombre: string): Promise<Zona | null> {
    const fila = await this.repo.findOne({ where: { nombre } });
    return fila ? this.aDominio(fila) : null;
  }

  private aDominio(fila: ZonaOrmEntity): Zona {
    return new Zona(fila.id, fila.nombre);
  }
}
