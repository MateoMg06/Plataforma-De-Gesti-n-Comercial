import { Bell, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { menu, type Rol } from './menu';
import './AppLayout.css';

// TODO HU-03 (Kevin V): tomar el usuario y su rol de la sesión de BetterAuth.
const usuario = { nombre: 'Usuario Demo', rol: 'administrador' as Rol };

export function AppLayout() {
  const navigate = useNavigate();
  const [cerrando, setCerrando] = useState(false);
  // HU-02: el layout es la parte PRIVADA de la app. Mientras comprueba la
  // sesión no se pinta nada; si no hay sesión, se vuelve al login.
  const [sesionValida, setSesionValida] = useState(false);
  const items = menu.filter((item) => item.roles.includes(usuario.rol));

  useEffect(() => {
    api<{ session: unknown } | null>('/auth/get-session')
      .then((datos) => {
        if (datos?.session) setSesionValida(true);
        else navigate('/login', { replace: true });
      })
      .catch(() => {
        // Sin backend o con error: más seguro quedarse fuera.
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  // HU-02: el logout borra la sesión EN EL SERVIDOR (no solo la cookie).
  async function cerrarSesion() {
    setCerrando(true);
    try {
      await api('/auth/sign-out', { method: 'POST' });
    } catch {
      // Si falla, igual salimos: la cookie ya no sirve y el guard hará el resto.
    } finally {
      navigate('/login');
    }
  }

  if (!sesionValida) return null;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          <span>Comercial 360</span>
        </div>
        <nav>
          {items.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} className="nav-item">
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <MenuIcon size={22} />
          <input className="input search" placeholder="Buscar clientes, contactos, rutas..." />
          <div className="topbar-right">
            <Bell size={20} />
            <div>
              <strong>{usuario.nombre}</strong>
              <div className="muted">{usuario.rol}</div>
            </div>
            <button className="btn logout" onClick={cerrarSesion} disabled={cerrando}>
              <LogOut size={18} />
              {cerrando ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
