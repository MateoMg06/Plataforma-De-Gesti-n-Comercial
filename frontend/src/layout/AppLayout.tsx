import { Bell, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { menu, type Rol } from './menu';
import './AppLayout.css';

// TODO HU-03 (Kevin V): tomar el usuario y su rol de la sesión de BetterAuth.
const usuario = { nombre: 'Usuario Demo', rol: 'administrador' as Rol };

export function AppLayout() {
  const navigate = useNavigate();
  const [cerrando, setCerrando] = useState(false);
  const items = menu.filter((item) => item.roles.includes(usuario.rol));

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
