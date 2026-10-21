import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
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

// Asesores y rutas con datos falsos: Mateo (ASESOR) y Andres (RUTA) aún no publican.
const ASESORES_FALSOS: Opcion[] = [
  { id: 1, nombre: 'Carlos Pérez' },
  { id: 2, nombre: 'María Gómez' },
];
const RUTAS_FALSAS: Opcion[] = [
  { id: 1, nombre: 'Ruta Norte' },
  { id: 2, nombre: 'Ruta Sur' },
];

const nombreDe = (lista: Opcion[], id: number | null) =>
  id === null ? '—' : (lista.find((x) => x.id === id)?.nombre ?? `#${id}`);

const ESTADO_COLOR: Record<string, string> = {
  programada: 'var(--info)',
  realizada: 'var(--success)',
  cancelada: 'var(--danger)',
  no_atendida: 'var(--warning)',
  reprogramada: 'var(--orange-500)',
};

// Pantalla de HU-18 y HU-19: programar visitas y registrar sus resultados.
export function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [clientes, setClientes] = useState<Opcion[]>([]);
  const [catalogo, setCatalogo] = useState<Opcion[]>([]);
  const [idCliente, setIdCliente] = useState('');
  const [idAsesor, setIdAsesor] = useState('');
  const [idRuta, setIdRuta] = useState('');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Estado del formulario de resultado (HU-19)
  const [visitaSel, setVisitaSel] = useState<Visita | null>(null);
  const [fechaReal, setFechaReal] = useState('');
  const [estadoResultado, setEstadoResultado] = useState('realizada');
  const [items, setItems] = useState<ItemResultado[]>([{ idResultado: '', observacion: '' }]);

  const cargar = () => api<Visita[]>('/visitas').then(setVisitas).catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
    api<{ datos: { id: number; razonSocial: string }[] }>('/clientes?limit=100')
      .then((pagina) => setClientes(pagina.datos.map((c) => ({ id: c.id, nombre: c.razonSocial }))))
      .catch((e) => setError(e.message));
    api<Opcion[]>('/resultados-visita')
      .then(setCatalogo)
      .catch((e) => setError(e.message));
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
    }
  };

  return (
    <div className="card">
      <h1 className="page-title">Visitas</h1>
      <p className="muted">
        Programar visita (HU-18) y registrar su resultado (HU-19). Clientes reales; asesores y rutas
        con datos falsos hasta que existan sus módulos.
      </p>

      <form className="form-visita" onSubmit={programar}>
        <label>
          Cliente
          <select className="input" value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required>
            <option value="">Selecciona un cliente</option>
            {clientes.map((c) => (
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
            <th>Fecha programada</th>
            <th>Fecha real</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visitas.map((v) => (
            <tr key={v.id}>
              <td>{nombreDe(clientes, v.idCliente)}</td>
              <td>{nombreDe(ASESORES_FALSOS, v.idAsesor)}</td>
              <td>{nombreDe(RUTAS_FALSAS, v.idRuta)}</td>
              <td>{new Date(v.fechaProgramada).toLocaleString()}</td>
              <td>{v.fechaReal ? new Date(v.fechaReal).toLocaleString() : '—'}</td>
              <td>
                <span className="badge-estado" style={{ background: ESTADO_COLOR[v.estado] ?? 'var(--text-muted)' }}>
                  {v.estado}
                </span>
              </td>
              <td>
                {v.estado !== 'realizada' && (
                  <button className="btn" type="button" onClick={() => abrirResultado(v)}>
                    Resultado
                  </button>
                )}
              </td>
            </tr>
          ))}
          {visitas.length === 0 && (
            <tr>
              <td colSpan={7} className="muted">Aún no hay visitas programadas</td>
            </tr>
          )}
        </tbody>
      </table>

      {visitaSel && (
        <form className="form-resultado" onSubmit={guardarResultado}>
          <h2>Registrar resultado de la visita #{visitaSel.id}</h2>
          <div className="fila-resultado">
            <label>
              Fecha real
              <input
                className="input"
                type="datetime-local"
                value={fechaReal}
                onChange={(e) => setFechaReal(e.target.value)}
                required
              />
            </label>
            <label>
              Estado
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

          <h3>Resultados del catálogo (opcional, varios)</h3>
          {items.map((it, i) => (
            <div className="fila-resultado" key={i}>
              <label>
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
              <label>
                Observación
                <input
                  className="input"
                  value={it.observacion}
                  onChange={(e) => cambiarItem(i, 'observacion', e.target.value)}
                  placeholder="Observación del resultado"
                />
              </label>
            </div>
          ))}
          <div className="acciones-resultado">
            <button
              className="btn"
              type="button"
              onClick={() => setItems([...items, { idResultado: '', observacion: '' }])}
            >
              Agregar otro resultado
            </button>
            <button className="btn btn-primary">Guardar resultado</button>
            <button className="btn" type="button" onClick={() => setVisitaSel(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
