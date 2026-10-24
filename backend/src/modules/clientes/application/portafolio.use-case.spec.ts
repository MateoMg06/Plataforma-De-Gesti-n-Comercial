import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Portafolio, type PortafolioDeCliente } from '../domain/portafolio.js';
import type { PortafolioRepository } from '../domain/portafolio.repository.js';
import { AgregarPortafolioClienteUseCase } from './agregar-portafolio-cliente.use-case.js';
import { CrearPortafolioUseCase } from './crear-portafolio.use-case.js';
import { EliminarPortafolioUseCase } from './eliminar-portafolio.use-case.js';
import type { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';
import { RetirarPortafolioClienteUseCase } from './retirar-portafolio-cliente.use-case.js';

// Repositorio en memoria: catálogo y asignaciones cliente-portafolio.
class PortafolioEnMemoria implements PortafolioRepository {
  portafolios: Portafolio[] = [];
  asignaciones: { idCliente: number; idPortafolio: number }[] = [];

  async guardar(p: Portafolio) {
    const guardado = new Portafolio(p.id ?? this.portafolios.length + 1, p.nombre, p.descripcion);
    this.portafolios = [...this.portafolios.filter((x) => x.id !== guardado.id), guardado];
    return guardado;
  }
  async listar() {
    return this.portafolios;
  }
  async buscarPorId(id: number) {
    return this.portafolios.find((p) => p.id === id) ?? null;
  }
  async buscarPorNombre(nombre: string) {
    return this.portafolios.find((p) => p.nombre === nombre) ?? null;
  }
  async eliminar(id: number) {
    if (this.asignaciones.some((a) => a.idPortafolio === id)) return false;
    this.portafolios = this.portafolios.filter((p) => p.id !== id);
    return true;
  }
  async listarDeCliente(idCliente: number): Promise<PortafolioDeCliente[]> {
    return this.asignaciones
      .filter((a) => a.idCliente === idCliente)
      .map((a) => ({ idPortafolio: a.idPortafolio, nombre: '', descripcion: '', fechaRegistro: new Date() }));
  }
  async estaAsignado(idCliente: number, idPortafolio: number) {
    return this.asignaciones.some((a) => a.idCliente === idCliente && a.idPortafolio === idPortafolio);
  }
  async asignar(idCliente: number, idPortafolio: number) {
    this.asignaciones.push({ idCliente, idPortafolio });
  }
  async retirar(idCliente: number, idPortafolio: number) {
    this.asignaciones = this.asignaciones.filter(
      (a) => !(a.idCliente === idCliente && a.idPortafolio === idPortafolio),
    );
  }
}

// Solo existe el cliente 1.
const obtenerCliente = {
  ejecutar: async (id: number) => {
    if (id !== 1) throw new NotFoundException('El cliente no existe');
    return { id };
  },
} as unknown as ObtenerClienteUseCase;

async function preparar() {
  const repo = new PortafolioEnMemoria();
  await new CrearPortafolioUseCase(repo).ejecutar('Soldadura', 'Equipos y electrodos');
  return repo;
}

describe('Portafolio (HU-09)', () => {
  it('no permite dos líneas con el mismo nombre', async () => {
    const repo = await preparar();
    await expect(
      new CrearPortafolioUseCase(repo).ejecutar(' Soldadura ', ''),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('exige nombre', async () => {
    await expect(
      new CrearPortafolioUseCase(new PortafolioEnMemoria()).ejecutar('  ', ''),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('agrega una línea al cliente y no la repite', async () => {
    const repo = await preparar();
    const agregar = new AgregarPortafolioClienteUseCase(repo, obtenerCliente);
    expect(await agregar.ejecutar(1, 1)).toHaveLength(1);
    await expect(agregar.ejecutar(1, 1)).rejects.toBeInstanceOf(ConflictException);
  });

  it('falla si el cliente o el portafolio no existen', async () => {
    const repo = await preparar();
    const agregar = new AgregarPortafolioClienteUseCase(repo, obtenerCliente);
    await expect(agregar.ejecutar(99, 1)).rejects.toBeInstanceOf(NotFoundException);
    await expect(agregar.ejecutar(1, 99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('retira una línea del cliente', async () => {
    const repo = await preparar();
    await new AgregarPortafolioClienteUseCase(repo, obtenerCliente).ejecutar(1, 1);
    const retirar = new RetirarPortafolioClienteUseCase(repo, obtenerCliente);
    expect(await retirar.ejecutar(1, 1)).toHaveLength(0);
    await expect(retirar.ejecutar(1, 1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no se elimina una línea asignada a clientes', async () => {
    const repo = await preparar();
    await new AgregarPortafolioClienteUseCase(repo, obtenerCliente).ejecutar(1, 1);
    await expect(
      new EliminarPortafolioUseCase(repo).ejecutar(1),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
