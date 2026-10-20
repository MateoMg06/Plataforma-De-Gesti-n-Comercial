import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ruta, ClienteEnRuta } from '../domain/ruta.js';
import type { RutaRepository } from '../domain/ruta.repository.js';
import { RutaClienteOrmEntity } from './ruta-cliente.orm-entity.js';
import { RutaOrmEntity } from './ruta.orm-entity.js';

@Injectable()
export class TypeOrmRutaRepository implements RutaRepository {
  constructor(
    @InjectRepository(RutaOrmEntity) private readonly repo: Repository<RutaOrmEntity>,
    @InjectRepository(RutaClienteOrmEntity)
    private readonly clientesRepo: Repository<RutaClienteOrmEntity>,
  ) {}

  async guardar(ruta: Ruta): Promise<Ruta> {
    return this.repo.manager.transaction(async (manager) => {
      const fila = await manager.save(RutaOrmEntity, {
        id: ruta.id ?? undefined,
        nombre: ruta.nombre,
        idAsesor: ruta.idAsesor,
        fechaInicio: ruta.fechaInicio,
        fechaFin: ruta.fechaFin,
        estado: ruta.estado,
      });
      await manager.delete(RutaClienteOrmEntity, { idRuta: fila.id });
      if (ruta.clientes.length > 0) {
        await manager.save(
          RutaClienteOrmEntity,
          ruta.clientes.map((cliente) => ({
            idRuta: fila.id,
            idCliente: cliente.idCliente,
            ordenVisita: cliente.ordenVisita,
          })),
        );
      }
      return this.aDominio(fila, ruta.clientes);
    });
  }

  async buscarPorId(id: number): Promise<Ruta | null> {
    const fila = await this.repo.findOne({ where: { id } });
    if (!fila) return null;
    const clientes = await this.clientesRepo.find({
      where: { idRuta: id },
      order: { ordenVisita: 'ASC' },
    });
    return this.aDominio(fila, clientes.map((cliente) => new ClienteEnRuta(cliente.idCliente, cliente.ordenVisita)));
  }

  async listar(): Promise<Ruta[]> {
    const filas = await this.repo.find({ order: { id: 'DESC' } });
    return Promise.all(filas.map(async (fila) => {
      const clientes = await this.clientesRepo.find({
        where: { idRuta: fila.id },
        order: { ordenVisita: 'ASC' },
      });
      return this.aDominio(fila, clientes.map((cliente) => new ClienteEnRuta(cliente.idCliente, cliente.ordenVisita)));
    }));
  }

  private aDominio(fila: RutaOrmEntity, clientes: ClienteEnRuta[] = []): Ruta {
    return new Ruta(
      fila.id,
      fila.nombre,
      fila.idAsesor,
      fila.fechaInicio,
      fila.fechaFin,
      fila.estado,
      clientes,
    );
  }
}
