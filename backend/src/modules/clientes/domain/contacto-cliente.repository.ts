import type { ContactoCliente } from './contacto-cliente.js';
export const CONTACTO_CLIENTE_REPOSITORY = Symbol(
  'CONTACTO_CLIENTE_REPOSITORY',
);
export interface ContactoClienteRepository {
  listar(idCliente: number): Promise<ContactoCliente[]>;
  guardar(contacto: ContactoCliente): Promise<ContactoCliente>;
  eliminar(idCliente: number, id: number): Promise<void>;
}
