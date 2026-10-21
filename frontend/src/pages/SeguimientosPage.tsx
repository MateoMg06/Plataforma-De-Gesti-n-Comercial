import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';

interface Seguimiento {
  id: number;
  id_visita: number;
  fecha_proxima: string;
  actividad: string;
  observacion: string;
  completado: boolean;
  fecha_completado: string | null;
  completado_por: string | null;
}

// Ejemplo de pantalla conectada al módulo seguimiento. HU-23: crear seguimiento
// desde una visita con id_visita, fecha_proxima, actividad y observación.
export function SeguimientosPage() {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [idVisita, setIdVisita] = useState('');
  const [fechaProxima, setFechaProxima] = useState('');
  const [actividad, setActividad] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');

  const cargar = () => api<Seguimiento[]>('/seguimientos').then(setSeguimientos).catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api('/seguimientos', {
        method: 'POST',
        body: JSON.stringify({ id_visita: Number(idVisita), fecha_proxima: fechaProxima, actividad, observacion }),
      });
      setIdVisita('');
      setFechaProxima('');
      setActividad('');
      setObservacion('');
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="card">
      <h1 className="page-title">Seguimientos</h1>
      <p className="muted">Lista de seguimientos (HU-23). Pantalla conectada a la API.</p>
      <form onSubmit={crear} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input
          className="input"
          value={idVisita}
          onChange={(e) => setIdVisita(e.target.value)}
          placeholder="ID visita"
          type="number"
        />
        <input
          className="input"
          value={fechaProxima}
          onChange={(e) => setFechaProxima(e.target.value)}
          placeholder="Fecha próxima"
        />
        <input
          className="input"
          value={actividad}
          onChange={(e) => setActividad(e.target.value)}
          placeholder="Actividad"
        />
        <input
          className="input"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Observación"
        />
        <button className="btn btn-primary">Crear seguimiento</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {seguimientos.map((s) => (
          <li key={s.id}>
            Visita: {s.id_visita} | Próxima: {s.fecha_proxima} | Act: {s.actividad} | Completado: {s.completado}
          </li>
        ))}
      </ul>
    </div>
  );
}