import { Ruta } from './ruta.js';

describe('Ruta', () => {
  const crearRuta = () => Ruta.crear('Ruta norte', 1, '2026-10-20', '2026-10-22');

  it('crea una ruta en estado planeada', () => {
    const ruta = crearRuta();

    expect(ruta.estado).toBe('planeada');
    expect(ruta.nombre).toBe('Ruta norte');
  });

  it('rechaza fechas inválidas o con fin anterior al inicio', () => {
    expect(() => Ruta.crear('Ruta norte', 1, '2026-02-30', '2026-03-01')).toThrow();
    expect(() => Ruta.crear('Ruta norte', 1, '2026-10-22', '2026-10-20')).toThrow();
  });

  it('agrega clientes con orden secuencial y no permite duplicados', () => {
    const ruta = crearRuta();
    ruta.agregarCliente(10);
    ruta.agregarCliente(20);

    expect(ruta.clientes.map((cliente) => [cliente.idCliente, cliente.ordenVisita])).toEqual([
      [10, 1],
      [20, 2],
    ]);
    expect(() => ruta.agregarCliente(10)).toThrow('El cliente ya está agregado a esta ruta');
  });

  it('reordena clientes y vuelve a numerarlos desde uno', () => {
    const ruta = crearRuta();
    ruta.agregarCliente(10);
    ruta.agregarCliente(20);
    ruta.agregarCliente(30);

    ruta.reordenarCliente(30, 1);

    expect(ruta.clientes.map((cliente) => [cliente.idCliente, cliente.ordenVisita])).toEqual([
      [30, 1],
      [10, 2],
      [20, 3],
    ]);
  });

  it('rechaza reordenar un cliente que no está en la ruta o una posición inválida', () => {
    const ruta = crearRuta();
    ruta.agregarCliente(10);

    expect(() => ruta.reordenarCliente(20, 1)).toThrow('El cliente no pertenece a esta ruta');
    expect(() => ruta.reordenarCliente(10, 2)).toThrow('El orden de visita no es válido');
  });
});
