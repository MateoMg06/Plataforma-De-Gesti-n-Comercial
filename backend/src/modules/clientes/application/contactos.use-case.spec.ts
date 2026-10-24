import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ContactoCliente } from '../domain/contacto-cliente.js';
import type { ContactoClienteRepository } from '../domain/contacto-cliente.repository.js';
import { CrearContactoUseCase, type DatosContacto } from './crear-contacto.use-case.js';
import { EditarContactoUseCase } from './editar-contacto.use-case.js';
import type { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';

// Repositorio en memoria para probar sin base de datos.
class ContactoRepositoryEnMemoria implements ContactoClienteRepository {
  contactos: ContactoCliente[] = [];

  async guardar(contacto: ContactoCliente) {
    const guardado = new ContactoCliente(
      contacto.id ?? this.contactos.length + 1,
      contacto.idCliente,
      contacto.nombre,
      contacto.cargo,
      contacto.telefono,
      contacto.celular,
      contacto.email,
      contacto.esPrincipal,
    );
    this.contactos = [...this.contactos.filter((c) => c.id !== guardado.id), guardado];
    return guardado;
  }

  async listarPorCliente(idCliente: number) {
    return this.contactos.filter((c) => c.idCliente === idCliente);
  }

  async buscarPorId(id: number) {
    return this.contactos.find((c) => c.id === id) ?? null;
  }

  async eliminar(id: number) {
    this.contactos = this.contactos.filter((c) => c.id !== id);
  }
}

// Solo existe el cliente 1.
class ObtenerClienteStub {
  async ejecutar(id: number) {
    if (id !== 1) throw new NotFoundException('El cliente no existe');
    return { id };
  }
}

const datos = (nombre: string, esPrincipal: boolean): DatosContacto => ({
  nombre,
  cargo: 'Compras',
  telefono: '6044441010',
  celular: '',
  email: `${nombre.toLowerCase()}@empresa.com`,
  esPrincipal,
});

describe('Contactos del cliente (HU-07)', () => {
  let repo: ContactoRepositoryEnMemoria;
  let crear: CrearContactoUseCase;

  beforeEach(() => {
    repo = new ContactoRepositoryEnMemoria();
    crear = new CrearContactoUseCase(repo, new ObtenerClienteStub() as unknown as ObtenerClienteUseCase);
  });

  it('crea contactos y permite un solo principal', async () => {
    await crear.ejecutar(1, datos('Ana', true));
    await crear.ejecutar(1, datos('Luis', false));
    await expect(crear.ejecutar(1, datos('Eva', true))).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.contactos).toHaveLength(2);
  });

  it('al editar, el mismo contacto principal puede seguir siéndolo', async () => {
    const ana = await crear.ejecutar(1, datos('Ana', true));
    const editar = new EditarContactoUseCase(repo);
    const editada = await editar.ejecutar(1, ana.id!, datos('Ana María', true));
    expect(editada.nombre).toBe('Ana María');
    expect(editada.esPrincipal).toBe(true);
  });

  it('al editar, no deja marcar un segundo principal', async () => {
    await crear.ejecutar(1, datos('Ana', true));
    const luis = await crear.ejecutar(1, datos('Luis', false));
    const editar = new EditarContactoUseCase(repo);
    await expect(editar.ejecutar(1, luis.id!, datos('Luis', true))).rejects.toThrow('contacto principal');
  });

  it('exige teléfono o celular y que el cliente exista', async () => {
    await expect(
      crear.ejecutar(1, { ...datos('Ana', false), telefono: '', celular: '' }),
    ).rejects.toThrow('teléfono o un celular');
    await expect(crear.ejecutar(99, datos('Ana', false))).rejects.toBeInstanceOf(NotFoundException);
  });
});
