import { Inject, Injectable } from '@nestjs/common';
import { ListarClientesUseCase } from '../../clientes/application/listar-clientes.use-case.js';
import { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';

export type ClienteSugeridoPorFrecuencia = {
  idCliente: number;
  razonSocial: string;
  frecuenciaVisitaDias: number;
  fechaUltimaVisita: string;
  diasDesdeUltimaVisita: number;
  diasAtraso: number;
};

@Injectable()
export class SugerirClientesPorFrecuenciaUseCase {
  constructor(
    private readonly listarClientes: ListarClientesUseCase,
    private readonly listarVisitas: ListarVisitasUseCase,
  ) {}

  async ejecutar(): Promise<ClienteSugeridoPorFrecuencia[]> {
    const [clientes, visitas] = await Promise.all([
      this.listarTodosLosClientes(),
      this.listarVisitas.ejecutar(),
    ]);

    const ultimaVisitaPorCliente = new Map<number, Date>();
    for (const visita of visitas) {
      if (visita.estado !== 'realizada' || !visita.fechaReal) continue;
      const ultima = ultimaVisitaPorCliente.get(visita.idCliente);
      if (!ultima || visita.fechaReal > ultima) {
        ultimaVisitaPorCliente.set(visita.idCliente, visita.fechaReal);
      }
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const inicioHoy = this.aMedianocheUtc(hoy);
    return clientes
      .flatMap((cliente) => {
        if (cliente.id === null) return [];
        const ultimaVisita = ultimaVisitaPorCliente.get(cliente.id);
        if (!ultimaVisita) return [];

        const fechaUltimaVisita = ultimaVisita.toISOString().slice(0, 10);
        const diasDesdeUltimaVisita = Math.floor(
          (inicioHoy - this.aMedianocheUtc(fechaUltimaVisita)) / 86_400_000,
        );
        const diasAtraso = diasDesdeUltimaVisita - cliente.frecuenciaVisitaDias;
        if (diasAtraso <= 0) return [];

        return [{
          idCliente: cliente.id,
          razonSocial: cliente.razonSocial,
          frecuenciaVisitaDias: cliente.frecuenciaVisitaDias,
          fechaUltimaVisita,
          diasDesdeUltimaVisita,
          diasAtraso,
        }];
      })
      .sort((a, b) => b.diasAtraso - a.diasAtraso);
  }

  private async listarTodosLosClientes() {
    const clientes = [];
    let page = 1;
    let total = 0;
    do {
      const pagina = await this.listarClientes.ejecutar({ page, limit: 100 });
      clientes.push(...pagina.datos);
      total = pagina.total;
      page += 1;
    } while (clientes.length < total);
    return clientes;
  }

  private aMedianocheUtc(fecha: string): number {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return Date.UTC(anio, mes - 1, dia);
  }
}
