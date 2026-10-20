import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Zona } from '../domain/zona.js';
import type { ZonaRepository } from '../domain/zona.repository.js';
import { ZonaOrmEntity } from './zona.orm-entity.js';

// Adaptador: implementa el puerto del dominio usando TypeORM + PostgreSQL.
@Injectable()
export class TypeOrmZonaRepository implements ZonaRepository {
  constructor(
    @InjectRepository(ZonaOrmEntity)
    private readonly repo: Repository<ZonaOrmEntity>,
  ) {}

  async guardar(zona: Zona): Promise<Zona> {
    try {
      const fila = await this.repo.save({
        id: zona.id ?? undefined,
        nombre: zona.nombre,
      });
      return this.aDominio(fila);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      ) {
        throw new ConflictException('Ya existe una zona con ese nombre');
      }
      throw error;
    }
  }

  async eliminar(id: number): Promise<boolean> {
    try {
      await this.repo.delete(id);
      return true;
    } catch (error) {
      // PostgreSQL protege también referencias creadas justo antes de eliminar.
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23503'
      )
        return false;
      throw error;
    }
  }

  async buscarPorId(id: number): Promise<Zona | null> {
    const fila = await this.repo.findOneBy({ id });
    return fila ? this.aDominio(fila) : null;
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
