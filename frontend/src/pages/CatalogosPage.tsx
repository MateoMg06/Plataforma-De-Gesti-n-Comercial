import { Link } from "react-router-dom";

export function CatalogosPage() {
  return (
    <div className="card">
      <h1 className="page-title">Catálogos de clientes</h1>
      <p className="muted">
        Administra las opciones disponibles al registrar clientes.
      </p>
      <ul>
        <li>
          <Link to="/configuracion/zonas">Zonas</Link>
        </li>
        <li>
          <Link to="/configuracion/tipos-cliente">Tipos de cliente</Link>
        </li>
        <li>
          <Link to="/configuracion/potenciales">Potenciales</Link>
        </li>
        <li>
          <Link to="/configuracion/estados-cliente">Estados de cliente</Link>
        </li>
      </ul>
    </div>
  );
}
