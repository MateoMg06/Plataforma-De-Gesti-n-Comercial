import { armarHistorial } from './historial-cliente.js';
import { Seguimiento } from './seguimiento.js';

describe('armarHistorial (HU-26)', () => {
  const datos = {
    visitas: [
      { id: 1, idCliente: 1, fechaProgramada: new Date('2026-10-10T09:00:00'), estado: 'realizada' },
      { id: 2, idCliente: 2, fechaProgramada: new Date('2026-10-11T09:00:00'), estado: 'programada' },
    ],
    seguimientos: [
      new Seguimiento(1, 1, '2026-10-15', 'Llamar al cliente', 'Pidió precios', false, null, null),
      new Seguimiento(2, 2, '2026-10-16', 'Otro cliente', '', false, null, null),
    ],
    cotizaciones: [{ numero: 1001, idCliente: 1, fecha: new Date('2026-10-12T09:00:00'), estado: 'aprobada', total: 1500000 }],
    pedidos: [{ numero: 1, idCliente: 1, fecha: new Date('2026-10-13T09:00:00'), estado: 'pendiente', valor: 1500000 }],
  };

  it('junta los 4 tipos del cliente, del más reciente al más antiguo', () => {
    const historial = armarHistorial(1, datos);
    expect(historial.map((e) => e.tipo)).toEqual(['seguimiento', 'pedido', 'cotizacion', 'visita']);
    expect(historial[0]).toMatchObject({ titulo: 'Llamar al cliente', estado: 'pendiente', detalle: 'Pidió precios' });
  });

  it('no incluye eventos de otros clientes (el seguimiento va por su visita)', () => {
    const historial = armarHistorial(2, datos);
    expect(historial.map((e) => e.titulo)).toEqual(['Otro cliente', 'Visita #2']);
  });
});
