import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { EstadoCliente } from '../domain/estado-cliente.js';
import type { EstadoClienteRepository } from '../domain/estado-cliente.repository.js';
import { EstadoClienteOrmEntity } from './estado-cliente.orm-entity.js';

@Injectable()
export class TypeOrmEstadoClienteRepository implements EstadoClienteRepository {
  constructor(
    @InjectRepository(EstadoClienteOrmEntity)
    private readonly repo: Repository<EstadoClienteOrmEntity>,
  ) {}

  async guardar(opcion: EstadoCliente): Promise<EstadoCliente> {
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
          'Ya existe un estado de cliente con ese nombre',
        );
      throw error;
    }
  }

  async listar(): Promise<EstadoCliente[]> {
    const filas = await this.repo.find({ order: { nombre: 'ASC' } });
    return filas.map((fila) => this.aDominio(fila));
  }

  async buscarPorId(id: number): Promise<EstadoCliente | null> {
    const fila = await this.repo.findOneBy({ id });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorNombre(nombre: string): Promise<EstadoCliente | null> {
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

  private aDominio(fila: EstadoClienteOrmEntity): EstadoCliente {
    return new EstadoCliente(fila.id, fila.nombre);
  }
}
