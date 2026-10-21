import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Potencial } from '../domain/potencial.js';
import type { PotencialRepository } from '../domain/potencial.repository.js';
import { PotencialOrmEntity } from './potencial.orm-entity.js';

@Injectable()
export class TypeOrmPotencialRepository implements PotencialRepository {
  constructor(
    @InjectRepository(PotencialOrmEntity)
    private readonly repo: Repository<PotencialOrmEntity>,
  ) {}

  async guardar(opcion: Potencial): Promise<Potencial> {
    try {
      const fila = await this.repo.save({
        ...opcion,
        id: opcion.id ?? undefined,
      });
      return this.aDominio(fila);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      )
        throw new ConflictException('Ya existe un potencial con ese nombre');
      throw error;
    }
  }

  async listar(): Promise<Potencial[]> {
    const filas = await this.repo.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
    return filas.map((fila) => this.aDominio(fila));
  }

  async buscarPorId(id: number): Promise<Potencial | null> {
    const fila = await this.repo.findOneBy({ id });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorNombre(nombre: string): Promise<Potencial | null> {
    const fila = await this.repo.findOneBy({ nombre });
    return fila ? this.aDominio(fila) : null;
  }

  async eliminar(id: number): Promise<boolean> {
    try {
      await this.repo.delete(id);
      return true;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23503'
      )
        return false;
      throw error;
    }
  }

  private aDominio(fila: PotencialOrmEntity): Potencial {
    return new Potencial(fila.id, fila.nombre, fila.orden);
  }
}
