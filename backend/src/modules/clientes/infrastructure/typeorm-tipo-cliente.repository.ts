import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { TipoCliente } from '../domain/tipo-cliente.js';
import type { TipoClienteRepository } from '../domain/tipo-cliente.repository.js';
import { TipoClienteOrmEntity } from './tipo-cliente.orm-entity.js';

@Injectable()
export class TypeOrmTipoClienteRepository implements TipoClienteRepository {
  constructor(
    @InjectRepository(TipoClienteOrmEntity)
    private readonly repo: Repository<TipoClienteOrmEntity>,
  ) {}

  async guardar(opcion: TipoCliente): Promise<TipoCliente> {
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
        throw new ConflictException(
          'Ya existe un tipo de cliente con ese nombre',
        );
      throw error;
    }
  }

  async listar(): Promise<TipoCliente[]> {
    const filas = await this.repo.find({ order: { nombre: 'ASC' } });
    return filas.map((fila) => this.aDominio(fila));
  }

  async buscarPorId(id: number): Promise<TipoCliente | null> {
    const fila = await this.repo.findOneBy({ id });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorNombre(nombre: string): Promise<TipoCliente | null> {
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

  private aDominio(fila: TipoClienteOrmEntity): TipoCliente {
    return new TipoCliente(fila.id, fila.nombre);
  }
}
