import { Link } from 'react-router-dom';
import type { MenuItem } from '../layout/menu';

// Página temporal: cada responsable la reemplaza por su pantalla real.
export function PlaceholderPage({ item }: { item: MenuItem }) {
  return (
    <div className="card">
      <h1 className="page-title">{item.label}</h1>
      <p className="muted">
        En construcción · Responsable: <strong>{item.responsable}</strong> · {item.historias}
      </p>
      {item.path === '/configuracion' && (
        <Link to="/configuracion/zonas" className="btn">
          Ver ejemplo: catálogo de zonas
        </Link>
      )}
    </div>
  );
}
