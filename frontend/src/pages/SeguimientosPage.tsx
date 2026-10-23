import { CheckCircle2, ClipboardList, Plus } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import './SeguimientosPage.css';

interface Seguimiento {
  id: number;
  id_visita: number;
  fecha_proxima: string;
  actividad: string;
  observacion: string;
  completado: boolean;
  vencido: boolean;
}

interface Visita {
  id: number;
  idCliente: number;
  fechaProgramada: string;
}

interface Opcion {
  id: number;
  nombre: string;
}

const formularioVacio = { idVisita: '', fechaProxima: '', actividad: '', observacion: '' };

// La fecha llega como AAAA-MM-DD; se arma a mediodía para que no cambie de día por la zona horaria.
const fecha = (texto: string) =>
  new Date(`${texto.slice(0, 10)}T12:00:00`).toLocaleDateString('es-CO', { dateStyle: 'medium' });

// HU-23 (crear desde una visita) y HU-24 (pendientes, vencidos resaltados, marcar completado).
export function SeguimientosPage() {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [clientes, setClientes] = useState<Opcion[]>([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargar = () => {
    setCargando(true);
    api<Seguimiento[]>('/seguimientos/pendientes')
      .then(setSeguimientos)
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    api<Visita[]>('/visitas')
      .then(setVisitas)
      .catch((e) => setError((e as Error).message));
    api<{ datos: { id: number; razonSocial: string }[] }>('/clientes?limit=100')
      .then((pagina) => setClientes(pagina.datos.map((c) => ({ id: c.id, nombre: c.razonSocial }))))
      .catch((e) => setError((e as Error).message));
  }, []);

  const clienteDeVisita = (idVisita: number) => {
    const visita = visitas.find((v) => v.id === idVisita);
    return clientes.find((c) => c.id === visita?.idCliente)?.nombre ?? `Visita #${idVisita}`;
  };

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      await api('/seguimientos', {
        method: 'POST',
        body: JSON.stringify({
          id_visita: Number(formulario.idVisita),
          fecha_proxima: formulario.fechaProxima,
          actividad: formulario.actividad,
          observacion: formulario.observacion,
        }),
      });
      setFormulario(formularioVacio);
      setMensaje('Seguimiento creado.');
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const completar = async (s: Seguimiento) => {
    setError('');
    setMensaje('');
    try {
      await api(`/seguimientos/${s.id}/completar`, { method: 'PATCH' });
      setMensaje(`"${s.actividad}" quedó completado.`);
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const vencidos = seguimientos.filter((s) => s.vencido).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <ClipboardList size={26} /> Seguimientos
          </h1>
          <p>Próximas acciones con los clientes después de cada visita.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="success">{mensaje}</p>}

      <div className="stack">
        <section className="card">
          <h2 className="section-title">
            <Plus size={18} /> Nuevo seguimiento
          </h2>
          <form className="form-grid" onSubmit={crear}>
            <label className="field">
              Visita
              <select
                className="input"
                value={formulario.idVisita}
                onChange={(e) => setFormulario({ ...formulario, idVisita: e.target.value })}
                required
              >
                <option value="">Selecciona una visita</option>
                {visitas.map((v) => (
                  <option key={v.id} value={v.id}>
                    {clienteDeVisita(v.id)} · {fecha(v.fechaProgramada)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Fecha próxima
              <input
                className="input"
                type="date"
                value={formulario.fechaProxima}
                onChange={(e) => setFormulario({ ...formulario, fechaProxima: e.target.value })}
                required
              />
            </label>
            <label className="field">
              Actividad
              <input
                className="input"
                value={formulario.actividad}
                onChange={(e) => setFormulario({ ...formulario, actividad: e.target.value })}
                placeholder="Ej.: llamar al cliente"
                maxLength={200}
                required
              />
            </label>
            <label className="field">
              Observación
              <input
                className="input"
                value={formulario.observacion}
                onChange={(e) => setFormulario({ ...formulario, observacion: e.target.value })}
                maxLength={500}
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary">
                <Plus size={18} /> Crear seguimiento
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2 className="section-title">
            <ClipboardList size={18} /> Pendientes
            <span className="muted">
              {seguimientos.length} pendientes{vencidos > 0 && ` · ${vencidos} vencidos`}
            </span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha próxima</th>
                  <th>Cliente</th>
                  <th>Actividad</th>
                  <th>Observación</th>
                  <th>Estado</th>
                  <th className="derecha">Acción</th>
                </tr>
              </thead>
              <tbody>
                {seguimientos.map((s) => (
                  <tr key={s.id} className={s.vencido ? 'fila-vencida' : undefined}>
                    <td><strong>{fecha(s.fecha_proxima)}</strong></td>
                    <td>{clienteDeVisita(s.id_visita)}</td>
                    <td>{s.actividad}</td>
                    <td className="muted">{s.observacion || '—'}</td>
                    <td>
                      <span className={`pill ${s.vencido ? 'pill-vencido' : 'pill-pendiente'}`}>
                        {s.vencido ? 'vencido' : 'pendiente'}
                      </span>
                    </td>
                    <td>
                      <div className="acciones">
                        <button className="btn btn-sm" onClick={() => completar(s)}>
                          <CheckCircle2 size={16} /> Completar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!cargando && seguimientos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="vacio">No hay seguimientos pendientes.</td>
                  </tr>
                )}
                {cargando && (
                  <tr>
                    <td colSpan={6} className="vacio">Cargando seguimientos…</td>
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
