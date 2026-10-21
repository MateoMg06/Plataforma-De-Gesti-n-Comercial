import { BadRequestException } from '@nestjs/common';
import { Cotizacion } from '../domain/cotizacion.js';
import type { CotizacionRepository } from '../domain/cotizacion.repository.js';
import { CrearCotizacionUseCase } from './crear-cotizacion.use-case.js';

// Gracias al puerto, el caso de uso se prueba con un repositorio en memoria,
// sin base de datos.
class CotizacionRepositoryEnMemoria implements CotizacionRepository {
  private cotizaciones: Cotizacion[] = [];
  private ultimoNumero = 0;

  async guardar(cotizacion: Cotizacion) {
    const guardada = new Cotizacion(
      this.cotizaciones.length + 1,
      cotizacion.numero,
      cotizacion.idCliente,
      cotizacion.idAsesor,
      cotizacion.fecha,
      cotizacion.estado,
      cotizacion.detalles,
    );
    this.cotizaciones.push(guardada);
    return guardada;
  }

  async buscarPorId(id: number) {
    return this.cotizaciones.find((c) => c.id === id) ?? null;
  }

  async listar() {
    return this.cotizaciones;
  }

  async obtenerSiguienteNumero() {
    this.ultimoNumero += 1;
    return this.ultimoNumero;
  }
}

describe('CrearCotizacionUseCase', () => {
  it('crea la cotización en borrador con número automático y total calculado', async () => {
    const useCase = new CrearCotizacionUseCase(new CotizacionRepositoryEnMemoria());

    const cotizacion = await useCase.ejecutar(1, 1, [
      { producto: 'Laptop', cantidad: 2, precio: 1500000 },
      { producto: 'Mouse', cantidad: 1, precio: 80000 },
    ]);

    expect(cotizacion.estado).toBe('borrador');
    expect(cotizacion.numero).toBe(1);
    expect(cotizacion.total).toBe(3080000);
    expect(cotizacion.detalles[0].subtotal).toBe(3000000);
  });

  it('rechaza precios no válidos', async () => {
    const useCase = new CrearCotizacionUseCase(new CotizacionRepositoryEnMemoria());

    await expect(
      useCase.ejecutar(1, 1, [{ producto: 'Laptop', cantidad: 1, precio: 0 }]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
