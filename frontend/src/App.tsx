import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { menu } from './layout/menu';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { CatalogosPage } from './pages/CatalogosPage';
import { ClientesPage } from './pages/ClientesPage';
import { EstadosClientePage } from './pages/EstadosClientePage';
import { PotencialesPage } from './pages/PotencialesPage';
import { TiposClientePage } from './pages/TiposClientePage';
import { VisitasPage } from './pages/VisitasPage';
import { ZonasPage } from './pages/ZonasPage';
import { RutasPage } from './pages/RutasPage';
import { AsesoresPage } from './pages/AsesoresPage';
import { AgendaPage } from './pages/AgendaPage';
import { SeguimientosPage } from './pages/SeguimientosPage';
import { CotizacionesPage } from './pages/CotizacionesPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapaPage } from './pages/MapaPage';
import { PedidosPage } from './pages/PedidosPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          {/* Cada responsable cambia su PlaceholderPage por su página real. */}
          {menu.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={
                item.path === '/dashboard' ? (
                  <DashboardPage />
                ) : item.path === '/visitas' ? (
                  <VisitasPage />
                ) : item.path === '/clientes' ? (
                  <ClientesPage />
                ) : item.path === '/configuracion' ? (
                  <CatalogosPage />
                ) : item.path === '/agenda' ? (
                  <AgendaPage />
                ) : item.path === '/rutas' ? (
                  <RutasPage />
                ) : item.path === '/seguimientos' ? (
                  <SeguimientosPage />
                ) : item.path === '/cotizaciones' ? (
                  <CotizacionesPage />
                ) : item.path === '/mapa' ? (
                  <MapaPage />
                ) : item.path === '/pedidos' ? (
                  <PedidosPage />
                ) : (
                  <PlaceholderPage item={item} />
                )
              }
            />
          ))}
          <Route
            path="/configuracion/tipos-cliente"
            element={<TiposClientePage />}
          />
          <Route
            path="/configuracion/potenciales"
            element={<PotencialesPage />}
          />
          <Route
            path="/configuracion/estados-cliente"
            element={<EstadosClientePage />}
          />
          <Route path="/configuracion/zonas" element={<ZonasPage />} />
          <Route path="/configuracion/asesores" element={<AsesoresPage />} />
          <Route path="/agenda/mia" element={<AgendaPage mia />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
