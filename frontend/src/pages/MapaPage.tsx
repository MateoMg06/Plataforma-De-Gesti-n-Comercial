import 'leaflet/dist/leaflet.css';
import { Map as MapIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { api } from '../api/client';
import './MapaPage.css';

interface Visita {
  id: number;
  idCliente: number;
  idAsesor: number;
  fechaProgramada: string;
  estado: string;
}

interface Cliente {
  id: number;
  razonSocial: string;
  direccion: string;
  municipio: string;
  latitud: number;
  longitud: number;
}

const ESTADOS = ['programada', 'realizada', 'reprogramada', 'no_atendida', 'cancelada'];

// Si no hay visitas, el mapa arranca en Medellín.
const CENTRO_POR_DEFECTO: [number, number] = [6.2442, -75.5812];

// HU-20 (Santiago): mapa de visitas con OpenStreetMap (sin claves de pago).
// Un círculo por visita en la ubicación del cliente, con el color de su estado.
export function MapaPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [asesores, setAsesores] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // HU-21: filtros del mapa. Se aplican sobre la lista ya cargada y se combinan entre sí.
  const [filtroAsesor, setFiltroAsesor] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');

  useEffect(() => {
    // Visitas, clientes (coordenadas) y asesores ya existen en el backend: no hace falta uno nuevo.
    Promise.all([
      api<Visita[]>('/visitas'),
      api<{ datos: Cliente[] }>('/clientes?limit=100'),
      api<{ id: number; nombre: string }[]>('/asesores'),
    ])
      .then(([listaVisitas, pagina, listaAsesores]) => {
        setVisitas(listaVisitas);
        setClientes(pagina.datos);
        setAsesores(Object.fromEntries(listaAsesores.map((a) => [a.id, a.nombre])));
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  }, []);

  // HU-21: los filtros se combinan (AND). Si un filtro está vacío, no restringe.
  const visitasFiltradas = visitas.filter((v) => {
    if (filtroAsesor && v.idAsesor !== Number(filtroAsesor)) return false;
    if (filtroEstado && v.estado !== filtroEstado) return false;
    const fecha = new Date(v.fechaProgramada).getTime();
    if (filtroDesde && fecha < new Date(filtroDesde).getTime()) return false;
    if (filtroHasta && fecha > new Date(filtroHasta).getTime()) return false;
    return true;
  });

  // Cada visita con las coordenadas de su cliente. Las que no tienen cliente con ubicación no se dibujan.
  const puntos = visitasFiltradas
    .map((v) => ({ visita: v, cliente: clientes.find((c) => c.id === v.idCliente) }))
    .filter((p): p is { visita: Visita; cliente: Cliente } => Boolean(p.cliente));

  const centro: [number, number] =
    puntos.length > 0
      ? [
          puntos.reduce((suma, p) => suma + Number(p.cliente.latitud), 0) / puntos.length,
          puntos.reduce((suma, p) => suma + Number(p.cliente.longitud), 0) / puntos.length,
        ]
      : CENTRO_POR_DEFECTO;

  // HU-21: el contador por estado también respeta los filtros aplicados.
  const cuantas = (estado: string) => visitasFiltradas.filter((v) => v.estado === estado).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <MapIcon size={26} /> Mapa de visitas
          </h1>
          <p>Cada punto es una visita en la ubicación de su cliente, con el color de su estado.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* HU-21: filtros combinables por asesor, estado y rango de fechas. */}
      <section className="card">
        <div className="toolbar mapa-filtros">
          <label className="field">
            Asesor
            <select
              className="input"
              value={filtroAsesor}
              onChange={(e) => setFiltroAsesor(e.target.value)}
            >
              <option value="">Todos</option>
              {Object.entries(asesores).map(([id, nombre]) => (
                <option key={id} value={id}>{nombre}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Estado
            <select
              className="input"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>{estado.replace('_', ' ')}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Desde
            <input
              className="input"
              type="datetime-local"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
            />
          </label>
          <label className="field">
            Hasta
            <input
              className="input"
              type="datetime-local"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
            />
          </label>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setFiltroAsesor('');
              setFiltroEstado('');
              setFiltroDesde('');
              setFiltroHasta('');
            }}
          >
            Limpiar filtros
          </button>
        </div>
        <p className="muted">
          Mostrando {visitasFiltradas.length} de {visitas.length} visitas
        </p>
      </section>

      <section className="card">
        <ul className="mapa-leyenda">
          {ESTADOS.map((estado) => (
            <li key={estado}>
              <span className={`mapa-punto punto-${estado}`} />
              <span className="mapa-estado">{estado.replace('_', ' ')}</span>
              <strong>{cuantas(estado)}</strong>
            </li>
          ))}
        </ul>
        {cargando ? (
          <p className="muted">Cargando mapa…</p>
        ) : (
          <MapContainer center={centro} zoom={12} className="mapa" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {puntos.map(({ visita, cliente }) => (
              <CircleMarker
                key={visita.id}
                center={[Number(cliente.latitud), Number(cliente.longitud)]}
                radius={10}
                // El color sale de las variables del tema (ver MapaPage.css).
                pathOptions={{ className: `marca marca-${visita.estado}` }}
              >
                <Popup>
                  <strong>{cliente.razonSocial}</strong>
                  <br />
                  {cliente.direccion}, {cliente.municipio}
                  <br />
                  Asesor: {asesores[visita.idAsesor] ?? `Asesor ${visita.idAsesor}`}
                  <br />
                  {new Date(visita.fechaProgramada).toLocaleString('es-CO', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                  <br />
                  <span className={`pill pill-${visita.estado}`}>{visita.estado.replace('_', ' ')}</span>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </section>
    </div>
  );
}
