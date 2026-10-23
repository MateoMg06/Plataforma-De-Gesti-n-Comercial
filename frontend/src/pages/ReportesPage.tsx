import { Download, LineChart, List, Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, apiDescargarArchivo } from '../api/client';
import './ReportesPage.css';

interface Fila {
  id: number;
  referencia: string;
  fecha: string;
  cliente: string;
  zona: string;
  asesor: string;
  estado: string;
  valor: number | null;
}

interface Reporte {
  visitas: Fila[];
  cotizaciones: Fila[];
  pedidos: Fila[];
  totales: {
    visitas: { cantidad: number; realizadas: number };
    cotizaciones: { cantidad: number; valor: number };
    pedidos: { cantidad: number; valor: number };
  };
}

interface Opcion {
  id: number;
  nombre: string;
}

type Tipo = 'visitas' | 'cotizaciones' | 'pedidos';

const filtrosVacios = { desde: '', hasta: '', idAsesor: '', idZona: '' };
const TIPOS: { valor: Tipo; texto: string }[] = [
  { valor: 'visitas', texto: 'Visitas' },
  { valor: 'cotizaciones', texto: 'Cotizaciones' },
  { valor: 'pedidos', texto: 'Pedidos' },
];

const pesos = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
// Eje Y corto: $1,5 M en vez de $1.500.000.
const pesosCortos = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', notation: 'compact', maximumFractionDigits: 1 }).format(valor);
const fecha = (texto: string) => new Date(texto).toLocaleDateString('es-CO', { dateStyle: 'medium' });

// Cuenta cuántas filas hay de cada estado, en el orden dado.
const contarPorEstado = (filas: Fila[], estados: string[]) =>
  estados.map((estado) => ({ estado, cantidad: filas.filter((f) => f.estado === estado).length }));

// HU-33 (reporte con filtros y totales), HU-34 (exportar CSV) y HU-35 (gráficos). Julian.
export function ReportesPage() {
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [asesores, setAsesores] = useState<Opcion[]>([]);
  const [zonas, setZonas] = useState<Opcion[]>([]);
  const [filtros, setFiltros] = useState(filtrosVacios);
  // Los filtros con los que se armó el reporte que se ve (los que usa la exportación).
  const [aplicados, setAplicados] = useState(filtrosVacios);
  const [tipo, setTipo] = useState<Tipo>('visitas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const parametros = (valores: typeof filtrosVacios) => {
    const params = new URLSearchParams();
    for (const [campo, valor] of Object.entries(valores)) if (valor) params.set(campo, valor);
    return params.toString();
  };

  const buscar = (valores: typeof filtrosVacios) => {
    setCargando(true);
    setError('');
    api<Reporte>(`/reportes?${parametros(valores)}`)
      .then((datos) => {
        setReporte(datos);
        setAplicados(valores);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    buscar(filtrosVacios);
    api<Opcion[]>('/asesores')
      .then(setAsesores)
      .catch((e) => setError((e as Error).message));
    api<Opcion[]>('/zonas')
      .then(setZonas)
      .catch((e) => setError((e as Error).message));
  }, []);

  const aplicar = (e: FormEvent) => {
    e.preventDefault();
    buscar(filtros);
  };

  // HU-35: al hacer clic en las barras de un asesor, el reporte se filtra por él.
  const filtrarPorAsesor = (nombre: string) => {
    const asesor = asesores.find((a) => a.nombre === nombre);
    if (!asesor) return;
    const nuevos = { ...filtros, idAsesor: String(asesor.id) };
    setFiltros(nuevos);
    buscar(nuevos);
  };

  const exportar = (tipoCsv: Tipo | 'clientes') => {
    setError('');
    apiDescargarArchivo(`/reportes/exportar/${tipoCsv}?${parametros(aplicados)}`, `${tipoCsv}.csv`).catch((e) =>
      setError((e as Error).message),
    );
  };

  const filas = reporte?.[tipo] ?? [];
  const totalTabla = filas.reduce((suma, f) => suma + (f.valor ?? 0), 0);

  // Datos de los 3 gráficos: salen del mismo reporte, así que cambian con los filtros.
  const visitasPorEstado = contarPorEstado(reporte?.visitas ?? [], ['programada', 'realizada', 'reprogramada', 'no_atendida', 'cancelada']);
  const cotizacionesPorEstado = contarPorEstado(reporte?.cotizaciones ?? [], ['borrador', 'enviada', 'aprobada', 'rechazada']);
  const valorPorAsesor = Object.values(
    [...(reporte?.cotizaciones ?? []).map((f) => ({ f, campo: 'cotizado' as const })), ...(reporte?.pedidos ?? []).map((f) => ({ f, campo: 'pedidos' as const }))].reduce<
      Record<string, { asesor: string; cotizado: number; pedidos: number }>
    >((grupos, { f, campo }) => {
      grupos[f.asesor] ??= { asesor: f.asesor, cotizado: 0, pedidos: 0 };
      grupos[f.asesor][campo] += f.valor ?? 0;
      return grupos;
    }, {}),
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <LineChart size={26} /> Reportes
          </h1>
          <p>Visitas, cotizaciones y pedidos por fechas, asesor y zona.</p>
        </div>
        <div className="page-actions">
          {(['clientes', 'visitas', 'cotizaciones', 'pedidos'] as const).map((t) => (
            <button key={t} className="btn btn-sm" onClick={() => exportar(t)} title="Exportar a CSV con los filtros aplicados">
              <Download size={16} /> {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stack">
        <section className="card">
          <form className="toolbar" onSubmit={aplicar}>
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
            <label className="field">
              Asesor
              <select className="input" value={filtros.idAsesor} onChange={(e) => setFiltros({ ...filtros, idAsesor: e.target.value })}>
                <option value="">Todos</option>
                {asesores.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Zona
              <select className="input" value={filtros.idZona} onChange={(e) => setFiltros({ ...filtros, idZona: e.target.value })}>
                <option value="">Todas</option>
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>{z.nombre}</option>
                ))}
              </select>
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

        {reporte && (
          <div className="reporte-totales">
            <div className="card">
              <span className="muted">Visitas</span>
              <strong>{reporte.totales.visitas.cantidad}</strong>
              <span className="muted">{reporte.totales.visitas.realizadas} realizadas</span>
            </div>
            <div className="card">
              <span className="muted">Cotizaciones</span>
              <strong>{reporte.totales.cotizaciones.cantidad}</strong>
              <span className="muted">{pesos(reporte.totales.cotizaciones.valor)}</span>
            </div>
            <div className="card">
              <span className="muted">Pedidos</span>
              <strong>{reporte.totales.pedidos.cantidad}</strong>
              <span className="muted">{pesos(reporte.totales.pedidos.valor)}</span>
            </div>
          </div>
        )}

        {/* HU-35: 3 gráficos con tooltip; se actualizan con los filtros. */}
        {reporte && (
          <div className="reporte-graficos">
            <section className="card">
              <h2 className="section-title">Visitas por estado</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={visitasPorEstado} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="estado" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(e: string) => e.replace('_', ' ')} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: 'var(--bg)' }} formatter={(v) => [v, 'Visitas']} />
                  <Bar dataKey="cantidad" fill="var(--info)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="card">
              <h2 className="section-title">Cotizaciones por estado</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cotizacionesPorEstado} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="estado" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: 'var(--bg)' }} formatter={(v) => [v, 'Cotizaciones']} />
                  <Bar dataKey="cantidad" fill="var(--info)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="card reporte-grafico-ancho">
              <h2 className="section-title">
                Valor por asesor <span className="muted">· clic en una barra para filtrar por ese asesor</span>
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={valorPorAsesor} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barGap={2}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="asesor" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={pesosCortos} />
                  <Tooltip cursor={{ fill: 'var(--bg)' }} formatter={(v) => pesos(Number(v))} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                  <Bar
                    dataKey="cotizado"
                    name="Cotizado"
                    fill="var(--info)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    cursor="pointer"
                    onClick={(d) => filtrarPorAsesor((d as unknown as { asesor: string }).asesor)}
                  />
                  <Bar
                    dataKey="pedidos"
                    name="En pedidos"
                    fill="var(--orange-500)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    cursor="pointer"
                    onClick={(d) => filtrarPorAsesor((d as unknown as { asesor: string }).asesor)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        )}

        <section className="card">
          <h2 className="section-title">
            <List size={18} /> Detalle
            <span className="reporte-pestanas" role="tablist">
              {TIPOS.map((t) => (
                <button
                  key={t.valor}
                  role="tab"
                  aria-selected={tipo === t.valor}
                  className={`btn btn-sm ${tipo === t.valor ? 'btn-primary' : ''}`}
                  onClick={() => setTipo(t.valor)}
                >
                  {t.texto} ({reporte?.[t.valor].length ?? 0})
                </button>
              ))}
            </span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Zona</th>
                  <th>Asesor</th>
                  <th>Estado</th>
                  {tipo !== 'visitas' && <th className="derecha">Valor</th>}
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.id}>
                    <td><strong>{f.referencia}</strong></td>
                    <td>{fecha(f.fecha)}</td>
                    <td>{f.cliente}</td>
                    <td>{f.zona}</td>
                    <td>{f.asesor}</td>
                    <td>
                      <span className={`pill pill-${f.estado}`}>{f.estado.replace('_', ' ')}</span>
                    </td>
                    {tipo !== 'visitas' && <td className="derecha">{pesos(f.valor ?? 0)}</td>}
                  </tr>
                ))}
                {!cargando && filas.length > 0 && (
                  <tr className="reporte-fila-total">
                    <td colSpan={6}>
                      <strong>Total: {filas.length}</strong>
                    </td>
                    {tipo !== 'visitas' && (
                      <td className="derecha">
                        <strong>{pesos(totalTabla)}</strong>
                      </td>
                    )}
                  </tr>
                )}
                {!cargando && filas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="vacio">No hay datos con estos filtros.</td>
                  </tr>
                )}
                {cargando && (
                  <tr>
                    <td colSpan={7} className="vacio">Cargando reporte…</td>
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
