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

  // Cada visita con las coordenadas de su cliente. Las que no tienen cliente con ubicación no se dibujan.
  const puntos = visitas
    .map((v) => ({ visita: v, cliente: clientes.find((c) => c.id === v.idCliente) }))
    .filter((p): p is { visita: Visita; cliente: Cliente } => Boolean(p.cliente));

  const centro: [number, number] =
    puntos.length > 0
      ? [
          puntos.reduce((suma, p) => suma + Number(p.cliente.latitud), 0) / puntos.length,
          puntos.reduce((suma, p) => suma + Number(p.cliente.longitud), 0) / puntos.length,
        ]
      : CENTRO_POR_DEFECTO;

  const cuantas = (estado: string) => visitas.filter((v) => v.estado === estado).length;

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
