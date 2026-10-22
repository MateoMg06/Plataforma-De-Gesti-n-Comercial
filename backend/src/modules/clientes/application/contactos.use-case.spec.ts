import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ContactoCliente,
  type DatosContacto,
} from '../domain/contacto-cliente.js';
import type { ContactoClienteRepository } from '../domain/contacto-cliente.repository.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';
import { CrearContactoUseCase } from './crear-contacto.use-case.js';
import { EditarContactoUseCase } from './editar-contacto.use-case.js';
import { EliminarContactoUseCase } from './eliminar-contacto.use-case.js';
import { ListarContactosUseCase } from './listar-contactos.use-case.js';

const datos: DatosContacto = {
  nombre: ' Ana ',
  cargo: 'Ventas',
  telefono: '',
  celular: '3001234567',
  email: 'ANA@EJEMPLO.COM',
  principal: true,
};
describe('HU-07 contactos', () => {
  let filas: ContactoCliente[];
  let repo: ContactoClienteRepository;
  let obtener: ObtenerClienteUseCase;
  beforeEach(() => {
    filas = [];
    repo = {
      listar: vi.fn(async (idCliente) =>
        filas.filter((c) => c.idCliente === idCliente),
      ),
      guardar: vi.fn(async (c) => {
        const guardado = new ContactoCliente(
          c.id ?? filas.length + 1,
          c.idCliente,
          c.datos,
        );
        filas = [...filas.filter((f) => f.id !== guardado.id), guardado];
        return guardado;
      }),
      eliminar: vi.fn(async (cliente, id) => {
        filas = filas.filter((c) => c.idCliente !== cliente || c.id !== id);
      }),
    };
    obtener = {
      ejecutar: vi.fn().mockResolvedValue({ id: 1 }),
    } as unknown as ObtenerClienteUseCase;
  });
  it('normaliza nombre y email y rechaza nombre vacío', () => {
    expect(ContactoCliente.crear(1, datos, []).datos).toMatchObject({
      nombre: 'Ana',
      email: 'ana@ejemplo.com',
    });
    expect(() =>
      ContactoCliente.crear(1, { ...datos, nombre: ' ' }, []),
    ).toThrow('nombre');
  });
  it('rechaza dos principales del mismo cliente, permite conservar el actual y otro cliente', () => {
    const principal = new ContactoCliente(1, 1, datos);
    expect(() => ContactoCliente.crear(1, datos, [principal])).toThrow(
      'principal',
    );
    expect(() => ContactoCliente.crear(1, datos, [principal], 1)).not.toThrow();
    expect(() => ContactoCliente.crear(2, datos, [principal])).not.toThrow();
  });
  it('crea, lista, edita y elimina contactos del cliente', async () => {
    const contacto = await new CrearContactoUseCase(repo, obtener).ejecutar(
      1,
      datos,
    );
    expect(
      await new ListarContactosUseCase(repo, obtener).ejecutar(1),
    ).toHaveLength(1);
    await new EditarContactoUseCase(repo, obtener).ejecutar(1, contacto.id!, {
      ...datos,
      nombre: 'María',
    });
    expect(filas[0].datos.nombre).toBe('María');
    await new EliminarContactoUseCase(repo, obtener).ejecutar(1, contacto.id!);
    expect(filas).toHaveLength(0);
  });
  it('no guarda un segundo principal', async () => {
    filas = [new ContactoCliente(1, 1, datos)];
    await expect(
      new CrearContactoUseCase(repo, obtener).ejecutar(1, datos),
    ).rejects.toThrow('principal');
    expect(repo.guardar).not.toHaveBeenCalled();
  });
  it('permite cambiar el principal después de desmarcar el anterior', async () => {
    filas = [new ContactoCliente(1, 1, datos)];
    await new EditarContactoUseCase(repo, obtener).ejecutar(1, 1, {
      ...datos,
      principal: false,
    });
    await new CrearContactoUseCase(repo, obtener).ejecutar(1, datos);
    expect(filas.filter((c) => c.datos.principal)).toHaveLength(1);
  });
  it('no permite editar ni eliminar contactos de otro cliente', async () => {
    filas = [new ContactoCliente(1, 2, datos)];
    await expect(
      new EditarContactoUseCase(repo, obtener).ejecutar(1, 1, datos),
    ).rejects.toThrow('no existe');
    await expect(
      new EliminarContactoUseCase(repo, obtener).ejecutar(1, 1),
    ).rejects.toThrow('no existe');
    expect(repo.guardar).not.toHaveBeenCalled();
    expect(repo.eliminar).not.toHaveBeenCalled();
  });
  it('no crea contactos si el cliente no existe', async () => {
    vi.mocked(obtener.ejecutar).mockRejectedValue(
      new Error('El cliente no existe'),
    );
    await expect(
      new CrearContactoUseCase(repo, obtener).ejecutar(1, datos),
    ).rejects.toThrow('cliente no existe');
    expect(repo.guardar).not.toHaveBeenCalled();
  });
});
