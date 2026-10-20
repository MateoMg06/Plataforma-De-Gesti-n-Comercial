import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import './VisitasPage.css';

interface Visita {
  id: number;
  idCliente: number;
  idAsesor: number;
  idRuta: number | null;
  fechaProgramada: string;
  estado: string;
}

// Datos falsos mientras Francisco publica CLIENTE y Mateo publica ASESOR (HU-18).
const CLIENTES_FALSOS = [
  { id: 1, nombre: 'Distribuidora El Norte' },
  { id: 2, nombre: 'Comercial Los Andes' },
  { id: 3, nombre: 'Almacén La Esquina' },
];
const ASESORES_FALSOS = [
  { id: 1, nombre: 'Carlos Pérez' },
  { id: 2, nombre: 'María Gómez' },
];
const RUTAS_FALSAS = [
  { id: 1, nombre: 'Ruta Norte' },
  { id: 2, nombre: 'Ruta Sur' },
];

const nombreDe = (lista: { id: number; nombre: string }[], id: number | null) =>
  id === null ? '—' : (lista.find((x) => x.id === id)?.nombre ?? `#${id}`);

const ESTADO_COLOR: Record<string, string> = {
  programada: 'var(--info)',
  realizada: 'var(--success)',
  cancelada: 'var(--danger)',
  no_atendida: 'var(--warning)',
  reprogramada: 'var(--orange-500)',
}
// Pantalla de HU-18: programar visita y ver las visitas programadas.
export function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [idCliente, setIdCliente] = useState('');
  const [idAsesor, setIdAsesor] = useState('');
  const [idRuta, setIdRuta] = useState('');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargar = () => api<Visita[]>('/visitas').then(setVisitas).catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const programar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      await api('/visitas', {
        method: 'POST',
        body: JSON.stringify({
          idCliente: Number(idCliente),
          idAsesor: Number(idAsesor),
          idRuta: idRuta ? Number(idRuta) : undefined,
          fechaProgramada: fecha,
        }),
      });
      setIdCliente('');
      setIdAsesor('');
      setIdRuta('');
      setFecha('');
      setMensaje('Visita programada');
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="card">
      <h1 className="page-title">Visitas</h1>
      <p className="muted">Programar visita (HU-18). Cliente y asesor con datos falsos hasta que existan sus módulos.</p>

      <form className="form-visita" onSubmit={programar}>
        <label>
          Cliente
          <select className="input" value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required>
            <option value="">Selecciona un cliente</option>
            {CLIENTES_FALSOS.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Asesor
          <select className="input" value={idAsesor} onChange={(e) => setIdAsesor(e.target.value)} required>
            <option value="">Selecciona un asesor</option>
            {ASESORES_FALSOS.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Ruta (opcional)
          <select className="input" value={idRuta} onChange={(e) => setIdRuta(e.target.value)}>
            <option value="">Sin ruta</option>
            {RUTAS_FALSAS.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Fecha y hora
          <input
            className="input"
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </label>
        <button className="btn btn-primary">Programar visita</button>
      </form>

      {mensaje && <p style={{ color: 'var(--success)' }}>{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      <h2>Visitas programadas</h2>
      <table className="tabla-visitas">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Asesor</th>
            <th>Ruta</th>
            <th>Fecha y hora</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {visitas.map((v) => (
            <tr key={v.id}>
              <td>{nombreDe(CLIENTES_FALSOS, v.idCliente)}</td>
              <td>{nombreDe(ASESORES_FALSOS, v.idAsesor)}</td>
              <td>{nombreDe(RUTAS_FALSAS, v.idRuta)}</td>
              <td>{new Date(v.fechaProgramada).toLocaleString()}</td>
              <td>
                <span className="badge-estado" style={{ background: ESTADO_COLOR[v.estado] ?? 'var(--text-muted)' }}>
                  {v.estado}
                </span>
              </td>
            </tr>
          ))}
          {visitas.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">Aún no hay visitas programadas</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
