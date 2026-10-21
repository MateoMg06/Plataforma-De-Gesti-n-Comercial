import {
  Briefcase,
  ChevronRight,
  CircleCheck,
  MapPinned,
  Settings,
  Tags,
  TrendingUp,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./CatalogosPage.css";

interface Opcion {
  ruta: string;
  titulo: string;
  detalle: string;
  icono: LucideIcon;
}

const catalogos: Opcion[] = [
  { ruta: "/configuracion/zonas", titulo: "Zonas", detalle: "Territorios donde están los clientes.", icono: MapPinned },
  { ruta: "/configuracion/tipos-cliente", titulo: "Tipos de cliente", detalle: "Industrial, distribuidor, retail…", icono: Tags },
  { ruta: "/configuracion/potenciales", titulo: "Potenciales", detalle: "Qué tan valioso es cada cliente.", icono: TrendingUp },
  { ruta: "/configuracion/estados-cliente", titulo: "Estados de cliente", detalle: "En qué etapa está la relación.", icono: CircleCheck },
  { ruta: "/configuracion/portafolio", titulo: "Portafolio", detalle: "Líneas de productos o servicios.", icono: Briefcase },
];

const equipo: Opcion[] = [
  { ruta: "/configuracion/asesores", titulo: "Asesores", detalle: "Asesores comerciales y su estado.", icono: UserCog },
];

function ListaOpciones({ opciones }: { opciones: Opcion[] }) {
  return (
    <ul className="config-lista">
      {opciones.map(({ ruta, titulo, detalle, icono: Icono }) => (
        <li key={ruta}>
          <Link to={ruta} className="config-item">
            <span className="config-icono">
              <Icono size={20} />
            </span>
            <span className="config-texto">
              <strong>{titulo}</strong>
              <span className="muted">{detalle}</span>
            </span>
            <ChevronRight size={18} className="config-flecha" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CatalogosPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <Settings size={26} /> Configuración
          </h1>
          <p>Administra los catálogos y el equipo comercial.</p>
        </div>
      </div>
      <div className="stack config-columnas">
        <section className="card">
          <h2 className="section-title">Catálogos de clientes</h2>
          <ListaOpciones opciones={catalogos} />
        </section>
        <section className="card">
          <h2 className="section-title">Equipo comercial</h2>
          <ListaOpciones opciones={equipo} />
        </section>
      </div>
    </div>
  );
}
