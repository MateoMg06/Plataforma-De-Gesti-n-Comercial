import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ContactoCliente } from '../domain/contacto-cliente.js';
import type { ContactoClienteRepository } from '../domain/contacto-cliente.repository.js';
import { ContactoClienteOrmEntity } from './contacto-cliente.orm-entity.js';
@Injectable()
export class TypeOrmContactoClienteRepository implements ContactoClienteRepository {
  constructor(
    @InjectRepository(ContactoClienteOrmEntity)
    private readonly repo: Repository<ContactoClienteOrmEntity>,
  ) {}
  async listar(idCliente: number): Promise<ContactoCliente[]> {
    const filas = await this.repo.find({
      where: { idCliente },
      order: { id: 'ASC' },
    });
    return filas.map(
      (f) =>
        new ContactoCliente(f.id, f.idCliente, {
          nombre: f.nombre,
          cargo: f.cargo,
          telefono: f.telefono,
          celular: f.celular,
          email: f.email,
          principal: f.principal,
        }),
    );
  }
  async guardar(contacto: ContactoCliente): Promise<ContactoCliente> {
    try {
      const fila = await this.repo.save({
        id: contacto.id ?? undefined,
        idCliente: contacto.idCliente,
        ...contacto.datos,
      });
      return new ContactoCliente(fila.id, fila.idCliente, contacto.datos);
    } catch (error) {
      // El índice protege la misma regla ante solicitudes simultáneas.
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      )
        throw new ConflictException(
          'El cliente ya tiene un contacto principal',
        );
      throw error;
    }
  }
  async eliminar(idCliente: number, id: number): Promise<void> {
    await this.repo.delete({ idCliente, id });
  }
}
