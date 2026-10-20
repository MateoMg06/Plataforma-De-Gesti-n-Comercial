import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Cliente } from '../domain/cliente.js';
import type { ClienteRepository } from '../domain/cliente.repository.js';
import { ClienteOrmEntity } from './cliente.orm-entity.js';
import { TipoClienteOrmEntity } from './tipo-cliente.orm-entity.js';
import { PotencialOrmEntity } from './potencial.orm-entity.js';
import { EstadoClienteOrmEntity } from './estado-cliente.orm-entity.js';

@Injectable()
export class TypeOrmClienteRepository implements ClienteRepository {
  constructor(
    @InjectRepository(ClienteOrmEntity)
    private readonly clientes: Repository<ClienteOrmEntity>,
    @InjectRepository(TipoClienteOrmEntity)
    private readonly tipos: Repository<TipoClienteOrmEntity>,
    @InjectRepository(PotencialOrmEntity)
    private readonly potenciales: Repository<PotencialOrmEntity>,
    @InjectRepository(EstadoClienteOrmEntity)
    private readonly estados: Repository<EstadoClienteOrmEntity>,
  ) {}

  listarTipos() {
    return this.tipos.find({ order: { nombre: 'ASC' } });
  }

  listarPotenciales() {
    return this.potenciales.find({ order: { orden: 'ASC', nombre: 'ASC' } });
  }

  listarEstados() {
    return this.estados.find({ order: { nombre: 'ASC' } });
  }

  async guardar(cliente: Cliente): Promise<Cliente> {
    try {
      const fila = await this.clientes.save({
        ...cliente,
        id: cliente.id ?? undefined,
      });
      return this.aDominio(fila);
    } catch (error) {
      // La restricción UNIQUE también protege dos registros simultáneos.
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      ) {
        throw new ConflictException('Ya existe un cliente con ese NIT o email');
      }
      throw error;
    }
  }

  async buscarPorId(id: number): Promise<Cliente | null> {
    const fila = await this.clientes.findOneBy({ id });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorNit(nit: string): Promise<Cliente | null> {
    const fila = await this.clientes.findOneBy({ nit });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorEmail(email: string): Promise<Cliente | null> {
    const fila = await this.clientes.findOneBy({ email });
    return fila ? this.aDominio(fila) : null;
  }

  existeTipoCliente(id: number): Promise<boolean> {
    return this.tipos.existsBy({ id });
  }

  existePotencial(id: number): Promise<boolean> {
    return this.potenciales.existsBy({ id });
  }

  existeEstadoCliente(id: number): Promise<boolean> {
    return this.estados.existsBy({ id });
  }

  private aDominio(fila: ClienteOrmEntity): Cliente {
    return new Cliente(fila.id, fila, fila.fechaCreacion, fila.activo);
  }
}
