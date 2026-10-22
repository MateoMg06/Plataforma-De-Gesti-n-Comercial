import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Portafolio, type PortafolioDeCliente } from '../domain/portafolio.js';
import type { PortafolioRepository } from '../domain/portafolio.repository.js';
import { ClientePortafolioOrmEntity } from './cliente-portafolio.orm-entity.js';
import { PortafolioOrmEntity } from './portafolio.orm-entity.js';

@Injectable()
export class TypeOrmPortafolioRepository implements PortafolioRepository {
  constructor(
    @InjectRepository(PortafolioOrmEntity)
    private readonly repo: Repository<PortafolioOrmEntity>,
    @InjectRepository(ClientePortafolioOrmEntity)
    private readonly asignaciones: Repository<ClientePortafolioOrmEntity>,
  ) {}

  async guardar(portafolio: Portafolio): Promise<Portafolio> {
    try {
      const fila = await this.repo.save({
        ...portafolio,
        id: portafolio.id ?? undefined,
      });
      return this.aDominio(fila);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      )
        throw new ConflictException('Ya existe un portafolio con ese nombre');
      throw error;
    }
  }

  async listar(): Promise<Portafolio[]> {
    const filas = await this.repo.find({ order: { nombre: 'ASC' } });
    return filas.map((fila) => this.aDominio(fila));
  }

  async buscarPorId(id: number): Promise<Portafolio | null> {
    const fila = await this.repo.findOneBy({ id });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorNombre(nombre: string): Promise<Portafolio | null> {
    const fila = await this.repo.findOneBy({ nombre });
    return fila ? this.aDominio(fila) : null;
  }

  async eliminar(id: number): Promise<boolean> {
    try {
      await this.repo.delete(id);
      return true;
    } catch (error) {
      // 23503: llave foránea. Algún cliente tiene este portafolio.
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23503'
      )
        return false;
      throw error;
    }
  }

  async listarDeCliente(idCliente: number): Promise<PortafolioDeCliente[]> {
    const filas = await this.asignaciones.find({
      where: { idCliente },
      relations: { portafolio: true },
      order: { fechaRegistro: 'DESC' },
    });
    return filas.map((fila) => ({
      idPortafolio: fila.idPortafolio,
      nombre: fila.portafolio.nombre,
      descripcion: fila.portafolio.descripcion,
      fechaRegistro: fila.fechaRegistro,
    }));
  }

  async estaAsignado(idCliente: number, idPortafolio: number): Promise<boolean> {
    return this.asignaciones.existsBy({ idCliente, idPortafolio });
  }

  async asignar(idCliente: number, idPortafolio: number): Promise<void> {
    await this.asignaciones.insert({ idCliente, idPortafolio });
  }

  async retirar(idCliente: number, idPortafolio: number): Promise<void> {
    await this.asignaciones.delete({ idCliente, idPortafolio });
  }

  private aDominio(fila: PortafolioOrmEntity): Portafolio {
    return new Portafolio(fila.id, fila.nombre, fila.descripcion);
  }
}
