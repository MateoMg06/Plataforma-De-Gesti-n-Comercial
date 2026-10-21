import { Injectable } from '@nestjs/common';
import type {
  DatoNombre,
  FilaCliente,
  FilaCotizacion,
  FilaPedido,
} from '../domain/kpis-dashboard.js';
import { type FuenteDatosDashboard } from '../domain/fuente-datos-dashboard.js';

// Adaptador con datos falsos (HU-32). El módulo dashboard no tiene tablas
// propias: mientras ventas y clientes no exporten sus casos de uso de
// lectura, el dashboard lee de aquí. Cada método se reemplaza por la
// llamada real sin tocar el resto del módulo.
@Injectable()
export class FuenteDatosFake implements FuenteDatosDashboard {
  listarCotizaciones(): Promise<FilaCotizacion[]> {
    // PENDIENTE: reemplazar por ListarCotizacionesUseCase (módulo ventas, Daniel).
    return Promise.resolve([
      { idAsesor: 1, estado: 'aprobada', valor: 2_450_000 },
      { idAsesor: 1, estado: 'enviada', valor: 1_200_000 },
      { idAsesor: 1, estado: 'borrador', valor: 640_000 },
      { idAsesor: 2, estado: 'aprobada', valor: 1_870_000 },
      { idAsesor: 2, estado: 'rechazada', valor: 980_000 },
      { idAsesor: 2, estado: 'enviada', valor: 750_000 },
      { idAsesor: 3, estado: 'borrador', valor: 430_000 },
    ]);
  }

  listarPedidos(): Promise<FilaPedido[]> {
    // PENDIENTE: la tabla PEDIDO aún no existe (dueño: Daniel), por eso el
    // KPI de pedidos por asesor sale vacío. No inventamos pedidos.
    return Promise.resolve([]);
  }

  listarClientes(): Promise<FilaCliente[]> {
    // PENDIENTE: reemplazar por ListarClientesUseCase (módulo clientes, Francisco).
    // El idAsesor solo existe en estos datos de muestra; los clientes reales
    // se filtrarán por las rutas del asesor (HU-32) cuando rutas exporte su lectura.
    return Promise.resolve([
      { idPotencial: 1, idAsesor: 1 },
      { idPotencial: 1, idAsesor: 1 },
      { idPotencial: 1, idAsesor: 2 },
      { idPotencial: 1, idAsesor: 3 },
      { idPotencial: 2, idAsesor: 1 },
      { idPotencial: 2, idAsesor: 2 },
      { idPotencial: 2, idAsesor: 2 },
      { idPotencial: 3, idAsesor: 3 },
      { idPotencial: 3, idAsesor: 2 },
    ]);
  }

  listarPotenciales(): Promise<DatoNombre[]> {
    // PENDIENTE: reemplazar por ListarPotencialesUseCase (módulo clientes, Francisco).
    // Estos nombres deben coincidir con el catálogo POTENCIAL de la base.
    return Promise.resolve([
      { id: 1, nombre: 'Alto' },
      { id: 2, nombre: 'Medio' },
      { id: 3, nombre: 'Bajo' },
    ]);
  }
}
