import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import './RutasPage.css';

interface RutaCreada {
  id: number;
  nombre: string;
  estado: string;
}

export function RutasPage() {
  const [nombre, setNombre] = useState('');
  const [idAsesor, setIdAsesor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [error, setError] = useState('');
  const [rutaCreada, setRutaCreada] = useState<RutaCreada | null>(null);
  const [guardando, setGuardando] = useState(false);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setRutaCreada(null);
    setGuardando(true);
    try {
      const ruta = await api<RutaCreada>('/rutas', {
        method: 'POST',
        body: JSON.stringify({
          nombre,
          id_asesor: Number(idAsesor),
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }),
      });
      setRutaCreada(ruta);
      setNombre('');
      setIdAsesor('');
      setFechaInicio('');
      setFechaFin('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

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

      {error && <p className="error" role="alert">{error}</p>}
      {rutaCreada && (
        <p className="ruta-confirmacion" role="status">
          Ruta “{rutaCreada.nombre}” creada con estado {rutaCreada.estado} (ID {rutaCreada.id}).
        </p>
      )}
    </section>
  );
}
