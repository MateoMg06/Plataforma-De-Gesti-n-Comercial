import type { MenuItem } from '../layout/menu';

// Página temporal: cada responsable la reemplaza por su pantalla real.
// No muestra responsables ni códigos de historia: la ven los usuarios en la demo.
export function PlaceholderPage({ item }: { item: MenuItem }) {
  return (
    <div className="card">
      <h1 className="page-title">{item.label}</h1>
      <p className="muted">Esta sección estará disponible pronto.</p>
    </div>
  );
}
