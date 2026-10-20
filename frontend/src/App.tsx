import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { menu } from './layout/menu';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ZonasPage } from './pages/ZonasPage';
import { RutasPage } from './pages/RutasPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          {/* Cada responsable cambia su PlaceholderPage por su página real. */}
          {menu.map((item) => (
            <Route key={item.path} path={item.path} element={<PlaceholderPage item={item} />} />
          ))}
          <Route path="/configuracion/zonas" element={<ZonasPage />} />
          <Route path="/rutas" element={<RutasPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
