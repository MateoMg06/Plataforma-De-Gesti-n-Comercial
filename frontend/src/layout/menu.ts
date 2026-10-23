import {
  BarChart3, Calendar, ClipboardCheck, FileText, History, LayoutDashboard, LineChart,
  Map, Route, Settings, ShoppingCart, Users, type LucideIcon,
} from 'lucide-react';

export type Rol = 'administrador' | 'lider' | 'asesor';

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  responsable: string;
  historias: string;
  // HU-03: el menú se filtra según el rol del usuario.
  roles: Rol[];
}

const todos: Rol[] = ['administrador', 'lider', 'asesor'];

export const menu: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, responsable: 'Julian', historias: 'HU-32', roles: todos },
  { path: '/rutas', label: 'Planeación de rutas', icon: Route, responsable: 'Andres', historias: 'HU-14 a HU-17', roles: ['administrador', 'lider'] },
  { path: '/agenda', label: 'Agenda', icon: Calendar, responsable: 'Mateo', historias: 'HU-11 a HU-13', roles: todos },
  { path: '/mapa', label: 'Mapa de visitas', icon: Map, responsable: 'Santiago', historias: 'HU-20 a HU-22', roles: ['administrador', 'lider'] },
  { path: '/clientes', label: 'Clientes', icon: Users, responsable: 'Francisco', historias: 'HU-05 a HU-07, HU-09', roles: todos },
  { path: '/visitas', label: 'Visitas', icon: ClipboardCheck, responsable: 'Santiago', historias: 'HU-18, HU-19', roles: todos },
  { path: '/cotizaciones', label: 'Cotizaciones', icon: FileText, responsable: 'Daniel', historias: 'HU-27 a HU-30', roles: todos },
  { path: '/pedidos', label: 'Pedidos', icon: ShoppingCart, responsable: 'Daniel', historias: 'HU-31', roles: todos },
  { path: '/seguimientos', label: 'Seguimientos', icon: BarChart3, responsable: 'Kevin B', historias: 'HU-23 a HU-26', roles: todos },
  { path: '/bitacora', label: 'Bitácora', icon: History, responsable: 'Kevin B', historias: 'HU-25', roles: ['administrador', 'lider'] },
  { path: '/reportes', label: 'Reportes', icon: LineChart, responsable: 'Julian', historias: 'HU-33 a HU-35', roles: ['administrador', 'lider'] },
  { path: '/configuracion', label: 'Configuración', icon: Settings, responsable: 'Kevin V / Francisco / Mateo', historias: 'HU-04, HU-08, HU-10', roles: ['administrador'] },
];
