import { History, List, Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';

interface Registro {
  id: number;
  usuarioId: string;
  usuarioNombre: string;
  accion: string;
  modulo: string;
  fecha: string;
  detalle: string;
}

// Mismas acciones que ACCIONES_BITACORA del backend, con un nombre legible.
const ACCIONES: Record<string, string> = {
  crear_cliente: 'Crear cliente',
  editar_cliente: 'Editar cliente',
  crear_visita: 'Programar visita',
  editar_visita: 'Resultado de visita',
  reprogramar_visita: 'Reprogramar visita',
  crear_seguimiento: 'Crear seguimiento',
  completar_seguimiento: 'Completar seguimiento',
  crear_cotizacion: 'Crear cotización',
  editar_cotizacion: 'Editar cotización',
  crear_pedido: 'Crear pedido',
  editar_pedido: 'Editar pedido',
};

const filtrosVacios = { usuarioId: '', accion: '', desde: '', hasta: '' };

const fechaHora = (texto: string) =>
  new Date(texto).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

// HU-25 (Kevin B): consultar la bitácora con filtros por usuario, fecha y tipo.
export function BitacoraPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  // Los usuarios del filtro salen de la misma bitácora (los que han hecho algo).
  const [usuarios, setUsuarios] = useState<{ id: string; nombre: string }[]>([]);
  const [filtros, setFiltros] = useState(filtrosVacios);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const buscar = (valores: typeof filtrosVacios) => {
    setCargando(true);
    setError('');
    const params = new URLSearchParams();
    for (const [campo, valor] of Object.entries(valores)) if (valor) params.set(campo, valor);
    return api<Registro[]>(`/bitacora?${params}`)
      .then((lista) => {
        setRegistros(lista);
        return lista;
      })
      .catch((e) => {
        setError((e as Error).message);
        return [];
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    buscar(filtrosVacios).then((lista) => {
      const unicos = new Map(lista.map((r) => [r.usuarioId, r.usuarioNombre]));
      setUsuarios([...unicos].map(([id, nombre]) => ({ id, nombre })));
    });
  }, []);

  const aplicar = (e: FormEvent) => {
    e.preventDefault();
    buscar(filtros);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <History size={26} /> Bitácora
          </h1>
          <p>Quién hizo qué y cuándo en las acciones clave del sistema.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stack">
        <section className="card">
          <form className="toolbar" onSubmit={aplicar}>
            <label className="field">
              Usuario
              <select className="input" value={filtros.usuarioId} onChange={(e) => setFiltros({ ...filtros, usuarioId: e.target.value })}>
                <option value="">Todos</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Tipo de acción
              <select className="input" value={filtros.accion} onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}>
                <option value="">Todas</option>
                {Object.entries(ACCIONES).map(([valor, texto]) => (
                  <option key={valor} value={valor}>{texto}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Desde
              <input className="input" type="date" value={filtros.desde} onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })} />
            </label>
            <label className="field">
              Hasta
              <input
                className="input"
                type="date"
                min={filtros.desde || undefined}
                value={filtros.hasta}
                onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary">
                <Search size={18} /> Buscar
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setFiltros(filtrosVacios);
                  buscar(filtrosVacios);
                }}
              >
                Limpiar
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2 className="section-title">
            <List size={18} /> Registros
            <span className="muted">
              {registros.length} {registros.length === 1 ? 'registro' : 'registros'}
            </span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id}>
                    <td>{fechaHora(r.fecha)}</td>
                    <td><strong>{r.usuarioNombre}</strong></td>
                    <td>{ACCIONES[r.accion] ?? r.accion}</td>
                    <td>{r.modulo}</td>
                    <td className="muted">{r.detalle}</td>
                  </tr>
                ))}
                {!cargando && registros.length === 0 && (
                  <tr>
                    <td colSpan={5} className="vacio">No hay registros con estos filtros.</td>
                  </tr>
                )}
                {cargando && (
                  <tr>
                    <td colSpan={5} className="vacio">Cargando bitácora…</td>
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
