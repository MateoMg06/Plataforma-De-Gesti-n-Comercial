import type { ContactoCliente } from './contacto-cliente.js';

export const CONTACTO_CLIENTE_REPOSITORY = Symbol('CONTACTO_CLIENTE_REPOSITORY');

// Puerto de los contactos de un cliente (HU-07).
export interface ContactoClienteRepository {
  guardar(contacto: ContactoCliente): Promise<ContactoCliente>;
  listarPorCliente(idCliente: number): Promise<ContactoCliente[]>;
  buscarPorId(id: number): Promise<ContactoCliente | null>;
  eliminar(id: number): Promise<void>;
}
