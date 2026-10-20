import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';

interface Zona {
  id: number;
  nombre: string;
}

// Ejemplo de pantalla conectada al backend (módulo zonas). Úsenla como referencia.
export function ZonasPage() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  const cargar = () => api<Zona[]>('/zonas').then(setZonas).catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api('/zonas', { method: 'POST', body: JSON.stringify({ nombre }) });
      setNombre('');
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="card">
      <h1 className="page-title">Zonas</h1>
      <p className="muted">Catálogo de zonas (HU-08). Pantalla de ejemplo conectada a la API.</p>
      <form onSubmit={crear} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nueva zona" />
        <button className="btn btn-primary">Agregar</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {zonas.map((z) => (
          <li key={z.id}>{z.nombre}</li>
        ))}
      </ul>
    </div>
  );
}
