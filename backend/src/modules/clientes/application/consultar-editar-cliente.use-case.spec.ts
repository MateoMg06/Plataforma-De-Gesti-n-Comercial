import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Cliente, type DatosCliente } from '../domain/cliente.js';
import type { ClienteRepository } from '../domain/cliente.repository.js';
import { ObtenerZonaUseCase } from '../../zonas/application/obtener-zona.use-case.js';
import { Zona } from '../../zonas/domain/zona.js';
import { EditarClienteUseCase } from './editar-cliente.use-case.js';
import { ListarClientesUseCase } from './listar-clientes.use-case.js';
import { CambiarActividadClienteUseCase } from './cambiar-actividad-cliente.use-case.js';

const datos: DatosCliente = {
  nit: '900123456-7',
  razonSocial: 'Comercial Ejemplo',
  nombreComercial: 'Ejemplo',
  direccion: 'Calle 10',
  departamento: 'Antioquia',
  municipio: 'Medellín',
  barrio: 'Centro',
  telefono: '6041234567',
  email: 'ventas@example.com',
  idZona: 1,
  idTipoCliente: 1,
  idPotencial: 1,
  idEstadoCliente: 1,
  frecuenciaVisitaDias: 15,
  latitud: 6.24,
  longitud: -75.58,
};

function preparar() {
  const original = new Cliente(
    1,
    datos,
    new Date('2026-10-01T12:00:00Z'),
    false,
  );
  const repositorio: ClienteRepository = {
    guardar: vi.fn().mockImplementation(async (cliente: Cliente) => cliente),
    buscarPorId: vi.fn().mockResolvedValue(original),
    buscarPorNit: vi.fn().mockResolvedValue(original),
    buscarPorEmail: vi.fn().mockResolvedValue(original),
    existeTipoCliente: vi.fn().mockResolvedValue(true),
    existePotencial: vi.fn().mockResolvedValue(true),
    existeEstadoCliente: vi.fn().mockResolvedValue(true),
    listarTipos: vi.fn().mockResolvedValue([]),
    listarPotenciales: vi.fn().mockResolvedValue([]),
    listarEstados: vi.fn().mockResolvedValue([]),
    listar: vi
      .fn()
      .mockResolvedValue({ datos: [original], total: 1, page: 1, limit: 10 }),
  };
  const obtenerZona = new ObtenerZonaUseCase({
    guardar: async (zona) => zona,
    listar: async () => [],
    eliminar: async () => true,
    buscarPorNombre: async () => null,
    buscarPorId: async (id) => (id === 1 ? new Zona(1, 'Centro') : null),
  });
  return {
    original,
    repositorio,
    editar: new EditarClienteUseCase(repositorio, obtenerZona),
  };
}

describe('EditarClienteUseCase', () => {
  it('permite conservar NIT y email propios y preserva identidad, fecha y actividad', async () => {
    const { original, editar } = preparar();
    const actualizado = await editar.ejecutar(1, {
      ...datos,
      razonSocial: ' Nueva razón ',
      email: 'VENTAS@example.com',
    });
    expect(actualizado.id).toBe(1);
    expect(actualizado.fechaCreacion).toEqual(original.fechaCreacion);
    expect(actualizado.activo).toBe(false);
    expect(actualizado.razonSocial).toBe('Nueva razón');
    expect(actualizado.email).toBe(datos.email);
  });

  it.each(['buscarPorNit', 'buscarPorEmail'] as const)(
    'rechaza un dato usado por otro cliente: %s',
    async (metodo) => {
      const { editar, repositorio } = preparar();
      vi.mocked(repositorio[metodo]).mockResolvedValue(
        new Cliente(2, datos, new Date(), true),
      );
      await expect(editar.ejecutar(1, datos)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repositorio.guardar).not.toHaveBeenCalled();
    },
  );

  it('rechaza un cliente inexistente sin guardar', async () => {
    const { editar, repositorio } = preparar();
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(null);
    await expect(editar.ejecutar(99, datos)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repositorio.guardar).not.toHaveBeenCalled();
  });

  it.each([
    'existeTipoCliente',
    'existePotencial',
    'existeEstadoCliente',
  ] as const)('rechaza un catálogo inexistente: %s', async (metodo) => {
    const { editar, repositorio } = preparar();
    vi.mocked(repositorio[metodo]).mockResolvedValue(false);
    await expect(editar.ejecutar(1, datos)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repositorio.guardar).not.toHaveBeenCalled();
  });

  it('rechaza una zona inexistente', async () => {
    const { editar, repositorio } = preparar();
    await expect(
      editar.ejecutar(1, { ...datos, idZona: 2 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repositorio.guardar).not.toHaveBeenCalled();
  });

  it.each([
    { razonSocial: ' ' },
    { frecuenciaVisitaDias: 0 },
    { latitud: 91 },
    { longitud: -181 },
  ])('conserva las reglas del registro: %j', async (cambio) => {
    const { editar, repositorio } = preparar();
    await expect(
      editar.ejecutar(1, { ...datos, ...cambio }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repositorio.guardar).not.toHaveBeenCalled();
  });
});

describe('CambiarActividadClienteUseCase', () => {
  it.each([true, false])(
    'establece actividad %s sin cambiar datos ni fecha',
    async (activo) => {
      const { original, repositorio } = preparar();
      const resultado = await new CambiarActividadClienteUseCase(
        repositorio,
      ).ejecutar(1, activo);
      expect(resultado).toEqual(
        new Cliente(1, datos, original.fechaCreacion, activo),
      );
      expect(original.activo).toBe(false);
    },
  );

  it('rechaza un cliente inexistente', async () => {
    const { repositorio } = preparar();
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(null);
    await expect(
      new CambiarActividadClienteUseCase(repositorio).ejecutar(99, true),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repositorio.guardar).not.toHaveBeenCalled();
  });
});

describe('ListarClientesUseCase', () => {
  it('recorta la búsqueda y conserva filtros y paginación', async () => {
    const { repositorio } = preparar();
    await new ListarClientesUseCase(repositorio).ejecutar({
      page: 2,
      limit: 20,
      busqueda: ' Ejemplo ',
      idZona: 1,
      idTipoCliente: 2,
      idPotencial: 3,
      idEstadoCliente: 4,
    });
    expect(repositorio.listar).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      busqueda: 'Ejemplo',
      idZona: 1,
      idTipoCliente: 2,
      idPotencial: 3,
      idEstadoCliente: 4,
    });
  });

  it.each([
    { page: 0, limit: 10 },
    { page: 1.5, limit: 10 },
    { page: 1, limit: 0 },
    { page: 1, limit: 101 },
    { page: 1, limit: 1.5 },
  ])('rechaza paginación inválida %j', (consulta) => {
    const { repositorio } = preparar();
    expect(() =>
      new ListarClientesUseCase(repositorio).ejecutar(consulta),
    ).toThrow(BadRequestException);
    expect(repositorio.listar).not.toHaveBeenCalled();
  });
});
