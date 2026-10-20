import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Cliente, type DatosCliente } from '../domain/cliente.js';
import type { ClienteRepository } from '../domain/cliente.repository.js';
import { ObtenerZonaUseCase } from '../../zonas/application/obtener-zona.use-case.js';
import { Zona } from '../../zonas/domain/zona.js';
import { RegistrarClienteUseCase } from './registrar-cliente.use-case.js';

const datos: DatosCliente = {
  nit: '900123456-7',
  razonSocial: 'Comercial Ejemplo',
  nombreComercial: 'Ejemplo',
  direccion: 'Calle 10 # 20-30',
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
  latitud: 6.2442,
  longitud: -75.5812,
};

class ClientesEnMemoria implements ClienteRepository {
  clientes: Cliente[] = [];
  tipoExiste = true;
  potencialExiste = true;
  estadoExiste = true;

  async listar(
    consulta: import('../domain/cliente.repository.js').ConsultaClientes,
  ) {
    return {
      datos: this.clientes.slice(
        (consulta.page - 1) * consulta.limit,
        consulta.page * consulta.limit,
      ),
      total: this.clientes.length,
      page: consulta.page,
      limit: consulta.limit,
    };
  }

  async listarTipos() {
    return [];
  }
  async listarPotenciales() {
    return [];
  }
  async listarEstados() {
    return [];
  }

  async guardar(cliente: Cliente) {
    const guardado = new Cliente(
      this.clientes.length + 1,
      cliente,
      cliente.fechaCreacion,
      cliente.activo,
    );
    this.clientes.push(guardado);
    return guardado;
  }
  async buscarPorId(id: number) {
    return this.clientes.find((c) => c.id === id) ?? null;
  }
  async buscarPorNit(nit: string) {
    return this.clientes.find((c) => c.nit === nit) ?? null;
  }
  async buscarPorEmail(email: string) {
    return this.clientes.find((c) => c.email === email) ?? null;
  }
  async existeTipoCliente() {
    return this.tipoExiste;
  }
  async existePotencial() {
    return this.potencialExiste;
  }
  async existeEstadoCliente() {
    return this.estadoExiste;
  }
}

function preparar() {
  const repositorio = new ClientesEnMemoria();
  const obtenerZona = new ObtenerZonaUseCase({
    eliminar: async () => true,
    guardar: async (zona) => zona,
    listar: async () => [new Zona(1, 'Centro')],
    buscarPorNombre: async () => null,
    buscarPorId: async (id) => (id === 1 ? new Zona(1, 'Centro') : null),
  });
  return {
    repositorio,
    caso: new RegistrarClienteUseCase(repositorio, obtenerZona),
  };
}

describe('RegistrarClienteUseCase', () => {
  it('registra un cliente activo con fecha y coordenadas', async () => {
    const { caso } = preparar();
    const cliente = await caso.ejecutar({
      ...datos,
      nit: ' 900123456-7 ',
      email: ' VENTAS@example.com ',
    });
    expect(cliente.id).toBe(1);
    expect(cliente.nit).toBe(datos.nit);
    expect(cliente.email).toBe(datos.email);
    expect(cliente.activo).toBe(true);
    expect(cliente.fechaCreacion).toBeInstanceOf(Date);
    expect(cliente.latitud).toBe(datos.latitud);
    expect(cliente.longitud).toBe(datos.longitud);
  });

  it('rechaza un NIT repetido aunque cambie el email', async () => {
    const { caso, repositorio } = preparar();
    await caso.ejecutar(datos);
    await expect(
      caso.ejecutar({ ...datos, email: 'otro@example.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repositorio.clientes).toHaveLength(1);
  });

  it('rechaza un email repetido sin distinguir mayúsculas', async () => {
    const { caso } = preparar();
    await caso.ejecutar(datos);
    await expect(
      caso.ejecutar({ ...datos, nit: 'otro-nit', email: 'VENTAS@example.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza una zona inexistente sin guardar el cliente', async () => {
    const { caso, repositorio } = preparar();
    await expect(caso.ejecutar({ ...datos, idZona: 2 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repositorio.clientes).toHaveLength(0);
  });

  it.each(['tipoExiste', 'potencialExiste', 'estadoExiste'] as const)(
    'rechaza un catálogo inexistente: %s',
    async (campo) => {
      const { caso, repositorio } = preparar();
      repositorio[campo] = false;
      await expect(caso.ejecutar(datos)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repositorio.clientes).toHaveLength(0);
    },
  );

  it('responde con error de validación ante reglas del dominio', async () => {
    const { caso } = preparar();
    await expect(
      caso.ejecutar({ ...datos, frecuenciaVisitaDias: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('Cliente', () => {
  it.each([
    { razonSocial: '  ' },
    { nit: ' ' },
    { frecuenciaVisitaDias: 0 },
    { frecuenciaVisitaDias: 1.5 },
    { idTipoCliente: 0 },
    { latitud: 91 },
    { latitud: NaN },
    { longitud: -181 },
    { longitud: Infinity },
  ])('rechaza datos inválidos: %j', (cambio) => {
    expect(() => Cliente.crear({ ...datos, ...cambio })).toThrow();
  });
});
