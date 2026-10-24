import { CalendarPlus, Check, ClipboardCheck, ClipboardList, List, Plus } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { api, apiTodosLosClientes } from '../api/client';
import './VisitasPage.css';

interface Visita {
  id: number;
  idCliente: number;
  idAsesor: number;
  idRuta: number | null;
  fechaProgramada: string;
  fechaReal: string | null;
  estado: string;
}

interface Opcion {
  id: number;
  nombre: string;
}

interface ItemResultado {
  idResultado: string;
  observacion: string;
}

// Fecha y hora cortas: 21 oct 2026, 10:30 a. m.
const fechaCorta = (texto: string) =>
  new Date(texto).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const nombreDe = (lista: Opcion[], id: number | null) =>
  id === null ? '—' : (lista.find((x) => x.id === id)?.nombre ?? `#${id}`);

// Pantalla de HU-18 y HU-19: programar visitas y registrar sus resultados.
export function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [clientes, setClientes] = useState<Opcion[]>([]);
  const [asesores, setAsesores] = useState<Opcion[]>([]);
  const [rutas, setRutas] = useState<Opcion[]>([]);
  const [catalogo, setCatalogo] = useState<Opcion[]>([]);
  const [idCliente, setIdCliente] = useState('');
  const [idAsesor, setIdAsesor] = useState('');
  const [idRuta, setIdRuta] = useState('');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  // Evita enviar dos veces el mismo formulario.
  const [guardando, setGuardando] = useState(false);

  // Estado del formulario de resultado (HU-19)
  const [visitaSel, setVisitaSel] = useState<Visita | null>(null);
  const [fechaReal, setFechaReal] = useState('');
  const [estadoResultado, setEstadoResultado] = useState('realizada');
  const [items, setItems] = useState<ItemResultado[]>([{ idResultado: '', observacion: '' }]);

  const cargar = () => api<Visita[]>('/visitas').then(setVisitas).catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
    apiTodosLosClientes<{ id: number; razonSocial: string }>()
      .then((lista) => setClientes(lista.map((c) => ({ id: c.id, nombre: c.razonSocial }))))
      .catch((e) => setError(e.message));
    // Asesores (HU-10) y rutas (HU-14) ya existen: se usan los datos reales.
    api<Opcion[]>('/asesores')
      .then(setAsesores)
      .catch((e) => setError(e.message));
    api<Opcion[]>('/rutas')
      .then(setRutas)
      .catch((e) => setError(e.message));
    api<Opcion[]>('/resultados-visita')
      .then(setCatalogo)
      .catch((e) => setError(e.message));
  }, []);

  // Al abrir el formulario de resultado, se lleva la pantalla hasta él.
  useEffect(() => {
    if (visitaSel) document.getElementById('form-resultado')?.scrollIntoView({ behavior: 'smooth' });
  }, [visitaSel]);

  const programar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);
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
    } finally {
      setGuardando(false);
    }
  };

  const abrirResultado = (v: Visita) => {
    setVisitaSel(v);
    setFechaReal('');
    setEstadoResultado('realizada');
    setItems([{ idResultado: '', observacion: '' }]);
    setMensaje('');
    setError('');
  };

  const cambiarItem = (indice: number, campo: keyof ItemResultado, valor: string) => {
    setItems(items.map((it, i) => (i === indice ? { ...it, [campo]: valor } : it)));
  };

  const guardarResultado = async (e: FormEvent) => {
    e.preventDefault();
    if (!visitaSel) return;
    setError('');
    setMensaje('');
    setGuardando(true);
    try {
      await api(`/visitas/${visitaSel.id}/resultados`, {
        method: 'POST',
        body: JSON.stringify({
          fechaReal,
          estado: estadoResultado,
          resultados: items
            .filter((it) => it.idResultado)
            .map((it) => ({ idResultado: Number(it.idResultado), observacion: it.observacion })),
        }),
      });
      setVisitaSel(null);
      setMensaje('Resultado registrado');
      cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <ClipboardCheck size={26} /> Visitas
          </h1>
          <p>Programa visitas a tus clientes y registra el resultado cuando las realices.</p>
        </div>
      </div>

      {mensaje && <p className="success" role="status">{mensaje}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <div className="stack">
        <form className="card" onSubmit={programar}>
          <h2 className="section-title">
            <CalendarPlus size={18} /> 1. Programar visita
          </h2>
          <fieldset className="form-grid" disabled={guardando}>
            <label className="field">
              Cliente *
              <select className="input" value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required>
                <option value="">Selecciona un cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Asesor *
              <select className="input" value={idAsesor} onChange={(e) => setIdAsesor(e.target.value)} required>
                <option value="">Selecciona un asesor</option>
                {asesores.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Ruta
              <select className="input" value={idRuta} onChange={(e) => setIdRuta(e.target.value)}>
                <option value="">Sin ruta</option>
                {rutas.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Fecha y hora *
              <input
                className="input"
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </label>
            <div className="form-actions span-all">
              <button className="btn btn-primary">
                <Check size={18} /> {guardando ? 'Guardando…' : 'Programar visita'}
              </button>
            </div>
          </fieldset>
        </form>

        <section className="card">
          <h2 className="section-title">
            <List size={18} /> Visitas programadas
            <span className="muted">{visitas.length} en total</span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Asesor</th>
                  <th>Ruta</th>
                  <th>Fecha programada</th>
                  <th>Fecha real</th>
                  <th>Estado</th>
                  <th className="derecha">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visitas.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{nombreDe(clientes, v.idCliente)}</strong></td>
                    <td>{nombreDe(asesores, v.idAsesor)}</td>
                    <td>{nombreDe(rutas, v.idRuta)}</td>
                    <td>{fechaCorta(v.fechaProgramada)}</td>
                    <td>{v.fechaReal ? fechaCorta(v.fechaReal) : '—'}</td>
                    <td>
                      <span className={`pill pill-${v.estado}`}>{v.estado.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <div className="acciones">
                        {v.estado !== 'realizada' && (
                          <button className="btn btn-sm btn-outline" type="button" onClick={() => abrirResultado(v)}>
                            Registrar resultado
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {visitas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="vacio">Aún no hay visitas programadas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {visitaSel && (
          <form id="form-resultado" className="card" onSubmit={guardarResultado}>
            <h2 className="section-title">
              <ClipboardList size={18} /> 2. Resultado de la visita
              <span className="muted">
                {nombreDe(clientes, visitaSel.idCliente)} ·{' '}
                {fechaCorta(visitaSel.fechaProgramada)}
              </span>
            </h2>
            <fieldset className="stack" disabled={guardando}>
              <div className="form-grid">
                <label className="field">
                  Fecha real *
                  <input
                    className="input"
                    type="datetime-local"
                    value={fechaReal}
                    onChange={(e) => setFechaReal(e.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  Estado de la visita *
                  <select
                    className="input"
                    value={estadoResultado}
                    onChange={(e) => setEstadoResultado(e.target.value)}
                  >
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="no_atendida">No atendida</option>
                  </select>
                </label>
              </div>

              <h3 className="subtitulo-visita">Resultados (opcional, puedes agregar varios)</h3>
              {items.map((it, i) => (
                <div className="form-grid" key={i}>
                  <label className="field">
                    Resultado
                    <select
                      className="input"
                      value={it.idResultado}
                      onChange={(e) => cambiarItem(i, 'idResultado', e.target.value)}
                    >
                      <option value="">Sin resultado</option>
                      {catalogo.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field span-2">
                    Observación
                    <input
                      className="input"
                      value={it.observacion}
                      onChange={(e) => cambiarItem(i, 'observacion', e.target.value)}
                      placeholder="Ej: Cliente interesado, pide cotización"
                    />
                  </label>
                </div>
              ))}
              <div className="form-actions">
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => setItems([...items, { idResultado: '', observacion: '' }])}
                >
                  <Plus size={18} /> Agregar otro resultado
                </button>
                <span className="form-actions-derecha">
                  <button className="btn" type="button" onClick={() => setVisitaSel(null)}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary">
                    <Check size={18} /> {guardando ? 'Guardando…' : 'Guardar resultado'}
                  </button>
                </span>
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
}
