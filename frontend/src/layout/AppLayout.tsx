import { Bell, Calendar, ChevronDown, LogOut, Menu as MenuIcon, Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { menu, type Rol } from './menu';
import './AppLayout.css';

// TODO HU-03 (Kevin V): tomar el rol de la sesión de BetterAuth.
const rol: Rol = 'administrador';

// Iniciales para el avatar: "Ana María Pérez" -> "AM".
const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');

// Fecha de hoy como en el diseño: "Martes, 21 de octubre de 2026".
const hoy = new Date().toLocaleDateString('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cerrando, setCerrando] = useState(false);
  // El nombre sí viene de la sesión: así se ve quién inició sesión.
  const [nombre, setNombre] = useState('');
  // HU-02: el layout es la parte PRIVADA de la app. Mientras comprueba la
  // sesión no se pinta nada; si no hay sesión, se vuelve al login.
  const [sesionValida, setSesionValida] = useState(false);
  const [menuCompacto, setMenuCompacto] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const items = menu.filter((item) => item.roles.includes(rol));

  // HU-03: si la ruta actual en la barra del navegador exige roles que el
  // usuario no tiene, lo redirigimos al dashboard.
  const rutaProtegida = menu.find(
    (item)=> location.pathname === item.path ||
    location.pathname.startsWith(item.path + '/'),
  );
  const noAutorizado = Boolean(sesionValida && rutaProtegida &&
    !rutaProtegida.roles.includes(rol)
  );
  useEffect(()=>{
    if (noAutorizado) {
      navigate('/dashboard', {replace:true})
    }
    [noAutorizado, navigate]
  });
  
  useEffect(() => {
    api<{ session: unknown; user: { name: string } } | null>('/auth/get-session')
      .then((datos) => {
        if (datos?.session) {
          setNombre(datos.user.name);
          setSesionValida(true);
        } else navigate('/login', { replace: true });
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

  // El buscador lleva a Clientes con el texto ya filtrado.
  function buscar(evento: FormEvent) {
    evento.preventDefault();
    const texto = busqueda.trim();
    if (texto) navigate(`/clientes?busqueda=${encodeURIComponent(texto)}`);
  }

  if (!sesionValida) return null;

  return (
    <div className={`layout ${menuCompacto ? 'layout-compacto' : ''}`}>
      <header className="topbar">
        <div className="topbar-brand">
          <img src="/favicon.svg" alt="" width={30} height={30} />
          <span>
            Comercial <strong>360</strong>
          </span>
        </div>
        <button
          className="btn-icon"
          type="button"
          aria-label={menuCompacto ? 'Mostrar nombres del menú' : 'Ocultar nombres del menú'}
          onClick={() => setMenuCompacto(!menuCompacto)}
        >
          <MenuIcon size={22} />
        </button>
        <form className="topbar-search" onSubmit={buscar} role="search">
          <input
            className="input"
            aria-label="Buscar clientes"
            placeholder="Buscar clientes por NIT o nombre…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn-icon" aria-label="Buscar">
            <Search size={18} />
          </button>
        </form>
        <div className="topbar-right">
          <div className="topbar-fecha">
            <Calendar size={18} />
            <span>{hoy}</span>
          </div>
          <Bell size={20} className="topbar-campana" aria-hidden="true" />
          <div className="usuario">
            <button
              className="usuario-boton"
              type="button"
              aria-expanded={menuUsuario}
              onClick={() => setMenuUsuario(!menuUsuario)}
            >
              <span className="avatar">{iniciales(nombre)}</span>
              <span className="usuario-datos">
                <strong>{nombre}</strong>
                <span>Administrador</span>
              </span>
              <ChevronDown size={18} />
            </button>
            {menuUsuario && (
              <div className="usuario-menu">
                <button type="button" onClick={cerrarSesion} disabled={cerrando}>
                  <LogOut size={16} />
                  {cerrando ? 'Saliendo…' : 'Cerrar sesión'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="layout-cuerpo">
        <aside className="sidebar">
          <nav>
            {items.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path} className="nav-item" title={label}>
                <Icon size={22} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="content">
          <Outlet />
        </main>
      </div>
      <footer className="app-footer">
        <span>© {new Date().getFullYear()} Comercial 360. Todos los derechos reservados.</span>
        <span>Versión 1.0.0</span>
      </footer>
    </div>
  );
}
