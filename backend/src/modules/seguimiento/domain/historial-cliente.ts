// HU-26: línea de tiempo del cliente. TypeScript puro, sin NestJS ni TypeORM.
// Junta visitas, seguimientos, cotizaciones y pedidos del cliente en una sola
// lista, del evento más reciente al más antiguo.
import type { Seguimiento } from './seguimiento.js';

export type TipoEvento = 'visita' | 'seguimiento' | 'cotizacion' | 'pedido';

export type EventoHistorial = {
  tipo: TipoEvento;
  fecha: Date;
  titulo: string;
  estado: string;
  detalle: string;
};

// Datos mínimos que llegan de los otros módulos (por sus casos de uso).
export type VisitaHistorial = { id: number; idCliente: number; fechaProgramada: Date; estado: string };
export type CotizacionHistorial = { numero: number; idCliente: number; fecha: Date; estado: string; total: number };
export type PedidoHistorial = { numero: number; idCliente: number; fecha: Date; estado: string; valor: number };

const pesos = (valor: number) => `$${Math.round(valor).toLocaleString('es-CO')}`;

export function armarHistorial(
  idCliente: number,
  datos: {
    visitas: VisitaHistorial[];
    seguimientos: Seguimiento[];
    cotizaciones: CotizacionHistorial[];
    pedidos: PedidoHistorial[];
  },
): EventoHistorial[] {
  const visitas = datos.visitas.filter((v) => v.idCliente === idCliente);
  // El seguimiento no guarda el cliente: es el de su visita.
  const idsVisitas = new Set(visitas.map((v) => v.id));

  const eventos: EventoHistorial[] = [
    ...visitas.map((v) => ({
      tipo: 'visita' as const,
      fecha: v.fechaProgramada,
      titulo: `Visita #${v.id}`,
      estado: v.estado,
      detalle: '',
    })),
    ...datos.seguimientos
      .filter((s) => idsVisitas.has(s.id_visita))
      .map((s) => ({
        tipo: 'seguimiento' as const,
        // fecha_proxima es AAAA-MM-DD: a mediodía para que no cambie de día por la zona horaria.
        fecha: new Date(`${s.fecha_proxima.slice(0, 10)}T12:00:00`),
        titulo: s.actividad,
        estado: s.completado ? 'completado' : 'pendiente',
        detalle: s.observacion,
      })),
    ...datos.cotizaciones
      .filter((c) => c.idCliente === idCliente)
      .map((c) => ({
        tipo: 'cotizacion' as const,
        fecha: c.fecha,
        titulo: `Cotización COT-${c.numero}`,
        estado: c.estado,
        detalle: pesos(c.total),
      })),
    ...datos.pedidos
      .filter((p) => p.idCliente === idCliente)
      .map((p) => ({
        tipo: 'pedido' as const,
        fecha: p.fecha,
        titulo: `Pedido PED-${p.numero}`,
        estado: p.estado,
        detalle: pesos(Number(p.valor)),
      })),
  ];
  return eventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}
