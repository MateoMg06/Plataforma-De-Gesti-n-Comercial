import { ChevronDown, ChevronUp, Info, MapPin, Plus, Route, Users } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { api, apiTodosLosClientes } from '../api/client';
import './RutasPage.css';

interface ClienteEnRuta {
  idCliente: number;
  ordenVisita: number;
}

interface Ruta {
  id: number;
  nombre: string;
  idAsesor: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  clientes: ClienteEnRuta[];
}

interface Asesor {
  id: number;
  nombre: string;
  estado: string;
}

interface Cliente {
  id: number;
  razonSocial: string;
  direccion: string;
  municipio: string;
}

interface ClienteSugerido {
  idCliente: number;
  razonSocial: string;
  frecuenciaVisitaDias: number;
  fechaUltimaVisita: string;
  diasDesdeUltimaVisita: number;
  diasAtraso: number;
}

// Basado en diseno_04 (Creación de rutas). HU-14, HU-15 y HU-16 (Andres).
export function RutasPage() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sugerencias, setSugerencias] = useState<ClienteSugerido[]>([]);
  const [nombre, setNombre] = useState('');
  const [idAsesor, setIdAsesor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [idRuta, setIdRuta] = useState('');
  const [idCliente, setIdCliente] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarRutas = async () => {
    const datos = await api<Ruta[]>('/rutas');
    setRutas(datos);
    if (!idRuta && datos.length > 0) setIdRuta(String(datos[0].id));
    return datos;
  };

  useEffect(() => {
    cargarRutas().catch((err) => setError((err as Error).message));
    // Nombres en vez de IDs: asesores (HU-10) y clientes (HU-05).
    api<Asesor[]>('/asesores')
      .then(setAsesores)
      .catch((err) => setError((err as Error).message));
    apiTodosLosClientes<Cliente>()
      .then(setClientes)
      .catch((err) => setError((err as Error).message));
    api<ClienteSugerido[]>('/rutas/sugerencias-frecuencia')
      .then(setSugerencias)
      .catch((err) => setError((err as Error).message));
  }, []);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);
    try {
      const ruta = await api<Ruta>('/rutas', {
        method: 'POST',
        body: JSON.stringify({
          nombre,
          id_asesor: Number(idAsesor),
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }),
      });
      setRutas((actuales) => [ruta, ...actuales]);
      setIdRuta(String(ruta.id));
      setNombre('');
      setIdAsesor('');
      setFechaInicio('');
      setFechaFin('');
      setMensaje(`Ruta “${ruta.nombre}” creada con estado ${ruta.estado}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const agregarCliente = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);
    try {
      await api(`/rutas/${idRuta}/clientes`, {
        method: 'POST',
        body: JSON.stringify({ id_cliente: Number(idCliente) }),
      });
      setIdCliente('');
      await cargarRutas();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const moverCliente = async (cliente: ClienteEnRuta, cambio: number) => {
    const ruta = rutas.find((item) => item.id === Number(idRuta));
    if (!ruta) return;
    const orden = cliente.ordenVisita + cambio;
    if (orden < 1 || orden > ruta.clientes.length) return;
    setError('');
    try {
      await api(`/rutas/${ruta.id}/clientes/${cliente.idCliente}/orden`, {
        method: 'PATCH',
        body: JSON.stringify({ orden_visita: orden }),
      });
      await cargarRutas();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // HU-16: activar (genera las visitas) o finalizar la ruta seleccionada.
  const cambiarEstado = async (accion: 'activar' | 'finalizar') => {
    setError('');
    setMensaje('');
    setGuardando(true);
    try {
      const ruta = await api<Ruta>(`/rutas/${idRuta}/${accion}`, { method: 'PATCH' });
      await cargarRutas();
      setMensaje(
        accion === 'activar'
          ? `Ruta activada: se programaron ${ruta.clientes.length} visitas.`
          : 'Ruta finalizada: ya no admite cambios.',
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const agregarSugerido = async (idClienteSugerido: number) => {
    if (!rutaSeleccionada || rutaSeleccionada.estado !== 'planeada') return;
    setError('');
    setMensaje('');
    setGuardando(true);
    try {
      await api(`/rutas/${rutaSeleccionada.id}/clientes`, {
        method: 'POST',
        body: JSON.stringify({ id_cliente: idClienteSugerido }),
      });
      await cargarRutas();
      setMensaje('Cliente sugerido agregado a la ruta.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const rutaSeleccionada = rutas.find((ruta) => ruta.id === Number(idRuta));
  // HU-16: una ruta finalizada no admite cambios (misma regla que el dominio).
  const rutaCerrada = rutaSeleccionada?.estado === 'finalizada';
  const clienteDe = (id: number) => clientes.find((c) => c.id === id);
  const asesorDe = (id: number) => asesores.find((a) => a.id === id)?.nombre ?? `Asesor ${id}`;
  // HU-10: solo los asesores activos pueden recibir rutas nuevas.
  const asesoresActivos = asesores.filter((a) => a.estado === 'activo');
  // En la lista para agregar no aparecen los clientes que ya están en la ruta.
  const clientesDisponibles = clientes.filter(
    (c) => !rutaSeleccionada?.clientes.some((enRuta) => enRuta.idCliente === c.id),
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <Route size={26} /> Planeación de rutas
          </h1>
          <p>Crea rutas comerciales y define en qué orden se visitan los clientes.</p>
        </div>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {mensaje && <p className="success" role="status">{mensaje}</p>}

      <div className="rutas-layout">
        <form className="card" onSubmit={crear}>
          <h2 className="section-title">
            <Info size={18} /> 1. Información de la ruta
          </h2>
          <fieldset className="rutas-form" disabled={guardando}>
            <label className="field">
              Nombre de la ruta *
              <input
                className="input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={100}
                placeholder="Ej: RUT-NORTE-001"
                required
              />
            </label>
            <label className="field">
              Asesor comercial *
              <select className="input" value={idAsesor} onChange={(e) => setIdAsesor(e.target.value)} required>
                <option value="">Selecciona un asesor</option>
                {asesoresActivos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </label>
            <div className="rutas-fechas">
              <label className="field">
                Fecha de inicio *
                <input className="input" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
              </label>
              <label className="field">
                Fecha de fin *
                <input
                  className="input"
                  type="date"
                  min={fechaInicio || undefined}
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                />
              </label>
            </div>
            <button className="btn btn-primary">{guardando ? 'Guardando…' : 'Crear ruta'}</button>
            <p className="rutas-nota">
              <Info size={16} /> Las rutas nuevas quedan en estado planeada.
            </p>
          </fieldset>
        </form>

        <section className="card">
          <div className="rutas-cabecera">
            <h2 className="section-title">
              <Users size={18} /> 2. Clientes y orden de visita
            </h2>
            <label className="field rutas-selector">
              Ruta
              <select className="input" value={idRuta} onChange={(e) => setIdRuta(e.target.value)}>
                <option value="">Selecciona una ruta</option>
                {rutas.map((ruta) => (
                  <option key={ruta.id} value={ruta.id}>{ruta.nombre}</option>
                ))}
              </select>
            </label>
          </div>

          {rutaSeleccionada && (
            <p className="rutas-resumen">
              <span className={`pill pill-${rutaSeleccionada.estado}`}>{rutaSeleccionada.estado}</span>
              <span>Asesor: <strong>{asesorDe(rutaSeleccionada.idAsesor)}</strong></span>
              <span>Del {rutaSeleccionada.fechaInicio} al {rutaSeleccionada.fechaFin}</span>
              <span><strong>{rutaSeleccionada.clientes.length}</strong> paradas</span>
              {rutaSeleccionada.estado === 'planeada' && (
                <button className="btn btn-primary btn-sm" disabled={guardando} onClick={() => cambiarEstado('activar')}>
                  Activar ruta
                </button>
              )}
              {rutaSeleccionada.estado === 'activa' && (
                <button className="btn btn-sm" disabled={guardando} onClick={() => cambiarEstado('finalizar')}>
                  Finalizar ruta
                </button>
              )}
            </p>
          )}

          <form className="toolbar rutas-agregar" onSubmit={agregarCliente}>
            <label className="field">
              Cliente
              <select
                className="input"
                value={idCliente}
                onChange={(e) => setIdCliente(e.target.value)}
                required
                disabled={!idRuta || rutaCerrada || guardando}
              >
                <option value="">Selecciona un cliente</option>
                {clientesDisponibles.map((c) => (
                  <option key={c.id} value={c.id}>{c.razonSocial} · {c.municipio}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-outline" disabled={!idRuta || rutaCerrada || guardando}>
              <Plus size={18} /> Agregar cliente
            </button>
          </form>
          {rutaCerrada && <p className="muted">Esta ruta está finalizada: ya no admite cambios.</p>}

          <div className="rutas-sugerencias">
            <h3>Clientes por visitar</h3>
            <p>Clientes que superaron su frecuencia de visita, ordenados por días de atraso.</p>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Última visita</th>
                    <th>Atraso</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sugerencias.map((cliente) => {
                    const yaEnRuta = rutaSeleccionada?.clientes.some(
                      (enRuta) => enRuta.idCliente === cliente.idCliente,
                    );
                    return (
                      <tr key={cliente.idCliente}>
                        <td><strong>{cliente.razonSocial}</strong></td>
                        <td>{cliente.fechaUltimaVisita}</td>
                        <td>{cliente.diasAtraso} días</td>
                        <td>
                          <button
                            className="btn btn-outline btn-sm"
                            type="button"
                            disabled={!rutaSeleccionada || rutaSeleccionada.estado !== 'planeada' || yaEnRuta || guardando}
                            onClick={() => agregarSugerido(cliente.idCliente)}
                          >
                            {yaEnRuta ? 'Ya está en la ruta' : 'Agregar a ruta'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {sugerencias.length === 0 && (
                    <tr><td colSpan={4} className="vacio">No hay clientes atrasados en su frecuencia de visita.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Municipio</th>
                  <th className="derecha">Mover</th>
                </tr>
              </thead>
              <tbody>
                {rutaSeleccionada?.clientes.map((cliente) => {
                  const datos = clienteDe(cliente.idCliente);
                  const nombreCliente = datos?.razonSocial ?? `Cliente ${cliente.idCliente}`;
                  return (
                    <tr key={cliente.idCliente}>
                      <td>
                        <span className="num num-programada">{cliente.ordenVisita}</span>
                      </td>
                      <td><strong>{nombreCliente}</strong></td>
                      <td>{datos?.direccion ?? '—'}</td>
                      <td>
                        {datos ? (
                          <span className="rutas-municipio"><MapPin size={14} /> {datos.municipio}</span>
                        ) : '—'}
                      </td>
                      <td>
                        <div className="acciones">
                          <button
                            className="btn-icon"
                            type="button"
                            aria-label={`Subir ${nombreCliente}`}
                            disabled={cliente.ordenVisita === 1 || rutaCerrada || guardando}
                            onClick={() => moverCliente(cliente, -1)}
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            className="btn-icon"
                            type="button"
                            aria-label={`Bajar ${nombreCliente}`}
                            disabled={cliente.ordenVisita === rutaSeleccionada.clientes.length || rutaCerrada || guardando}
                            onClick={() => moverCliente(cliente, 1)}
                          >
                            <ChevronDown size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!rutaSeleccionada || rutaSeleccionada.clientes.length === 0) && (
                  <tr>
                    <td colSpan={5} className="vacio">
                      {rutaSeleccionada ? 'Esta ruta aún no tiene clientes.' : 'Crea o selecciona una ruta.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
