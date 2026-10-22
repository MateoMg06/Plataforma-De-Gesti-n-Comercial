import { BadRequestException, ConflictException } from '@nestjs/common';
import { CotizacionEstado } from '../../../common/enums/domain.enums.js';
import { Cotizacion, CotizacionDetalle } from '../domain/cotizacion.js';
import type { CotizacionRepository } from '../domain/cotizacion.repository.js';
import { Pedido } from '../domain/pedido.js';
import type { PedidoRepository } from '../domain/pedido.repository.js';
import { ConvertirCotizacionEnPedidoUseCase } from './convertir-cotizacion-en-pedido.use-case.js';

// Repositorios en memoria: el caso de uso se prueba sin base de datos.
class CotizacionesEnMemoria implements CotizacionRepository {
  constructor(private cotizaciones: Cotizacion[]) {}
  async guardar(cotizacion: Cotizacion) {
    return cotizacion;
  }
  async buscarPorId(id: number) {
    return this.cotizaciones.find((c) => c.id === id) ?? null;
  }
  async listar() {
    return this.cotizaciones;
  }
  async obtenerSiguienteNumero() {
    return 1;
  }
}

class PedidosEnMemoria implements PedidoRepository {
  pedidos: Pedido[] = [];
  async guardar(pedido: Pedido) {
    const guardado = new Pedido(
      this.pedidos.length + 1,
      pedido.numero,
      pedido.idCotizacion,
      pedido.idCliente,
      pedido.valor,
      pedido.estado,
      pedido.fecha,
    );
    this.pedidos.push(guardado);
    return guardado;
  }
  async buscarPorId(id: number) {
    return this.pedidos.find((p) => p.id === id) ?? null;
  }
  async buscarPorCotizacion(idCotizacion: number) {
    return this.pedidos.find((p) => p.idCotizacion === idCotizacion) ?? null;
  }
  async listar() {
    return this.pedidos;
  }
  async obtenerSiguienteNumero() {
    return this.pedidos.length + 1;
  }
}

const cotizacion = (id: number, estado: CotizacionEstado) =>
  new Cotizacion(id, id, 1, 1, new Date(), estado, [
    CotizacionDetalle.crear('Laptop', 2, 1000),
  ]);

describe('ConvertirCotizacionEnPedidoUseCase', () => {
  it('convierte una cotización aprobada en pedido con su total', async () => {
    const pedidos = new PedidosEnMemoria();
    const useCase = new ConvertirCotizacionEnPedidoUseCase(
      new CotizacionesEnMemoria([cotizacion(1, CotizacionEstado.APROBADA)]),
      pedidos,
    );
    const pedido = await useCase.ejecutar(1);
    expect(pedido.idCotizacion).toBe(1);
    expect(pedido.valor).toBe(2000);
  });

  it('no convierte dos veces la misma cotización', async () => {
    const pedidos = new PedidosEnMemoria();
    const useCase = new ConvertirCotizacionEnPedidoUseCase(
      new CotizacionesEnMemoria([cotizacion(1, CotizacionEstado.APROBADA)]),
      pedidos,
    );
    await useCase.ejecutar(1);
    await expect(useCase.ejecutar(1)).rejects.toBeInstanceOf(ConflictException);
    expect(pedidos.pedidos).toHaveLength(1);
  });

  it('solo convierte cotizaciones aprobadas', async () => {
    const useCase = new ConvertirCotizacionEnPedidoUseCase(
      new CotizacionesEnMemoria([cotizacion(1, CotizacionEstado.ENVIADA)]),
      new PedidosEnMemoria(),
    );
    await expect(useCase.ejecutar(1)).rejects.toBeInstanceOf(BadRequestException);
  });
});
