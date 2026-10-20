import { Bell, Menu as MenuIcon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { menu, type Rol } from './menu';
import './AppLayout.css';

// TODO HU-03 (Kevin V): tomar el usuario y su rol de la sesión de BetterAuth.
const usuario = { nombre: 'Usuario Demo', rol: 'administrador' as Rol };

export function AppLayout() {
  const items = menu.filter((item) => item.roles.includes(usuario.rol));

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
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
