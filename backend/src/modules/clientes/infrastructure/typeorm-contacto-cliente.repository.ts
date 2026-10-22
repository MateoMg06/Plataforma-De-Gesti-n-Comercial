import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactoCliente } from '../domain/contacto-cliente.js';
import type { ContactoClienteRepository } from '../domain/contacto-cliente.repository.js';
import { ContactoClienteOrmEntity } from './contacto-cliente.orm-entity.js';

@Injectable()
export class TypeOrmContactoClienteRepository implements ContactoClienteRepository {
  constructor(
    @InjectRepository(ContactoClienteOrmEntity)
    private readonly repo: Repository<ContactoClienteOrmEntity>,
  ) {}

  async guardar(contacto: ContactoCliente): Promise<ContactoCliente> {
    const fila = await this.repo.save({
      ...contacto,
      id: contacto.id ?? undefined,
    });
    return this.aDominio(fila);
  }

  async listarPorCliente(idCliente: number): Promise<ContactoCliente[]> {
    // El principal primero y luego por nombre.
    const filas = await this.repo.find({
      where: { idCliente },
      order: { esPrincipal: 'DESC', nombre: 'ASC' },
    });
    return filas.map((fila) => this.aDominio(fila));
  }

  async buscarPorId(id: number): Promise<ContactoCliente | null> {
    const fila = await this.repo.findOneBy({ id });
    return fila ? this.aDominio(fila) : null;
  }

  async eliminar(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  private aDominio(fila: ContactoClienteOrmEntity): ContactoCliente {
    return new ContactoCliente(
      fila.id,
      fila.idCliente,
      fila.nombre,
      fila.cargo,
      fila.telefono,
      fila.celular,
      fila.email,
      fila.esPrincipal,
    );
  }
}
