import { ChevronRight, List, UserPlus, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Usuario {
  id: string;
  name: string;
  email: string;
  role?: string;
  // Plugin admin de BetterAuth: un usuario "baneado" está desactivado y no puede entrar.
  banned?: boolean | null;
}

interface RespuestaListaUsuarios {
  users?: Usuario[];
  total?: number;
  limit?: number;
  offset?: number;
}

const rolValido = ["administrador", "lider", "asesor"] as const;

const vacio = { nombre: "", correo: "", password: "", rol: "asesor" };

// HU-04 (Kevin V): administración de usuarios con el plugin admin de BetterAuth:
// crear, listar y activar/desactivar. No se eliminan usuarios (tienen historial):
// desactivar es "ban", que impide iniciar sesión y cierra sus sesiones abiertas.
export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    api<RespuestaListaUsuarios>("/auth/admin/list-users")
      .then((datos) => setUsuarios(datos.users ?? []))
      .catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const cancelar = () => setForm(vacio);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await api("/auth/admin/create-user", {
        method: "POST",
        body: JSON.stringify({
          name: form.nombre,
          email: form.correo,
          password: form.password,
          role: form.rol,
        }),
      });
      cancelar();
      await cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (usuario: Usuario) => {
    // Activo -> desactivado (ban-user); desactivado -> activo (unban-user).
    const activo = !usuario.banned;
    if (activo && !window.confirm(`¿Desactivar a ${usuario.name}? No podrá iniciar sesión.`)) return;
    setError("");
    setGuardando(true);
    try {
      await api(activo ? "/auth/admin/ban-user" : "/auth/admin/unban-user", {
        method: "POST",
        body: JSON.stringify(
          activo
            ? { userId: usuario.id, banReason: "Desactivado por el administrador" }
            : { userId: usuario.id },
        ),
      });
      await cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <nav className="breadcrumb">
        <Link to="/configuracion">Configuración</Link>
        <ChevronRight size={14} />
        <span>Usuarios</span>
      </nav>
      <div className="page-header">
        <div>
          <h1>
            <Users size={26} /> Usuarios
          </h1>
          <p>
            Los usuarios inactivos no pueden iniciar sesión. El correo no se
            puede repetir.
          </p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="stack">
        <form className="card" onSubmit={guardar}>
          <h2 className="section-title">
            <UserPlus size={18} /> Nuevo usuario
          </h2>
          <div className="form-grid">
            <label className="field">
              Nombre
              <input
                required
                maxLength={100}
                disabled={guardando}
                className="input"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Ana Pérez"
              />
            </label>
            <label className="field">
              Correo
              <input
                required
                type="email"
                maxLength={150}
                disabled={guardando}
                className="input"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                placeholder="ana@empresa.com"
              />
            </label>
            <label className="field">
              Contraseña
              <input
                required
                type="password"
                maxLength={100}
                disabled={guardando}
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Contraseña de acceso"
              />
            </label>
            <label className="field">
              Rol
              <select
                required
                disabled={guardando}
                className="input"
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
              >
                {rolValido.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button disabled={guardando} className="btn btn-primary">
                {guardando ? "Guardando…" : "Agregar"}
              </button>
              <button
                type="button"
                className="btn"
                disabled={guardando}
                onClick={cancelar}
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
        <div className="card">
          <h2 className="section-title">
            <List size={18} /> Usuarios registrados
            <span className="muted">{usuarios.length} en total</span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="derecha">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`pill pill-${u.banned ? "inactivo" : "activo"}`}>
                        {u.banned ? "inactivo" : "activo"}
                      </span>
                    </td>
                    <td>
                      <div className="acciones">
                        <button
                          className="btn btn-sm"
                          disabled={guardando}
                          onClick={() => void cambiarEstado(u)}
                        >
                          {u.banned ? "Activar" : "Desactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="vacio">
                      Aún no hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
