import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import './RutasPage.css';

interface ClienteEnRuta {
  idCliente: number;
  ordenVisita: number;
}

interface Ruta {
  id: number;
  nombre: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  clientes: ClienteEnRuta[];
}

export function RutasPage() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
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
    try {
      await api(`/rutas/${idRuta}/clientes`, {
        method: 'POST',
        body: JSON.stringify({ id_cliente: Number(idCliente) }),
      });
      setIdCliente('');
      await cargarRutas();
    } catch (err) {
      setError((err as Error).message);
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

  const rutaSeleccionada = rutas.find((ruta) => ruta.id === Number(idRuta));

  return (
    <section className="card rutas-page">
      <h1 className="page-title">Planeación de rutas</h1>
      <p className="muted">Crea una ruta comercial. Las rutas nuevas quedan en estado planeada.</p>

      <form className="ruta-form" onSubmit={crear}>
        <label>
          Nombre de la ruta
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} required />
        </label>
        <label>
          ID del asesor
          <input className="input" type="number" min="1" step="1" value={idAsesor} onChange={(e) => setIdAsesor(e.target.value)} required />
        </label>
        <label>
          Fecha de inicio
          <input className="input" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
        </label>
        <label>
          Fecha de fin
          <input className="input" type="date" min={fechaInicio || undefined} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
        </label>
        <button className="btn btn-primary" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Crear ruta'}
        </button>
      </form>

      <section className="clientes-ruta">
        <h2>Clientes y orden de visita</h2>
        <label>
          Ruta
          <select className="input" value={idRuta} onChange={(e) => setIdRuta(e.target.value)}>
            <option value="">Selecciona una ruta</option>
            {rutas.map((ruta) => <option key={ruta.id} value={ruta.id}>{ruta.nombre} (ID {ruta.id})</option>)}
          </select>
        </label>
        <form className="agregar-cliente-form" onSubmit={agregarCliente}>
          <label>
            ID del cliente
            <input className="input" type="number" min="1" step="1" value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required disabled={!idRuta} />
          </label>
          <button className="btn btn-primary" disabled={!idRuta}>Agregar cliente</button>
        </form>
        {rutaSeleccionada && rutaSeleccionada.clientes.length > 0 && (
          <ol className="clientes-ordenados">
            {rutaSeleccionada.clientes.map((cliente) => (
              <li key={cliente.idCliente}>
                <span>Cliente {cliente.idCliente}</span>
                <span className="acciones-orden">
                  <button className="btn" type="button" aria-label={`Subir cliente ${cliente.idCliente}`} disabled={cliente.ordenVisita === 1} onClick={() => moverCliente(cliente, -1)}>↑</button>
                  <button className="btn" type="button" aria-label={`Bajar cliente ${cliente.idCliente}`} disabled={cliente.ordenVisita === rutaSeleccionada.clientes.length} onClick={() => moverCliente(cliente, 1)}>↓</button>
                </span>
              </li>
            ))}
          </ol>
        )}
        {rutaSeleccionada && rutaSeleccionada.clientes.length === 0 && <p className="muted">Esta ruta aún no tiene clientes.</p>}
      </section>

      {error && <p className="error" role="alert">{error}</p>}
      {mensaje && <p className="ruta-confirmacion" role="status">{mensaje}</p>}
    </section>
  );
}
