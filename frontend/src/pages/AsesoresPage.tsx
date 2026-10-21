import { ChevronRight, List, Pencil, UserCog, UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Asesor {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  estado: "activo" | "inactivo";
}

const vacio = { nombre: "", correo: "", telefono: "" };

// HU-10: crear, editar y activar/inactivar asesores. Mismo patrón que ZonasPage.
export function AsesoresPage() {
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    api<Asesor[]>("/asesores")
      .then(setAsesores)
      .catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const cancelar = () => {
    setEditando(null);
    setForm(vacio);
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await api(editando === null ? "/asesores" : `/asesores/${editando}`, {
        method: editando === null ? "POST" : "PUT",
        body: JSON.stringify(form),
      });
      cancelar();
      await cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (asesor: Asesor) => {
    const estado = asesor.estado === "activo" ? "inactivo" : "activo";
    // Inactivar tiene consecuencias (no recibe rutas nuevas): se pide confirmación.
    if (
      estado === "inactivo" &&
      !window.confirm(`¿Inactivar a ${asesor.nombre}? No recibirá rutas nuevas.`)
    )
      return;
    setError("");
    setGuardando(true);
    try {
      await api(`/asesores/${asesor.id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado }),
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
        <span>Asesores</span>
      </nav>
      <div className="page-header">
        <div>
          <h1>
            <UserCog size={26} /> Asesores
          </h1>
          <p>
            Los asesores inactivos no reciben rutas nuevas. El correo no se
            puede repetir.
          </p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="stack">
        <form className="card" onSubmit={guardar}>
          <h2 className="section-title">
            {editando === null ? <UserPlus size={18} /> : <Pencil size={18} />}
            {editando === null ? "Nuevo asesor" : "Editar asesor"}
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
              Teléfono
              <input
                required
                maxLength={20}
                disabled={guardando}
                className="input"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="300 123 4567"
              />
            </label>
            <div className="form-actions">
              <button disabled={guardando} className="btn btn-primary">
                {guardando ? "Guardando…" : editando === null ? "Agregar" : "Guardar"}
              </button>
              {editando !== null && (
                <button
                  type="button"
                  className="btn"
                  disabled={guardando}
                  onClick={cancelar}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>
        <div className="card">
          <h2 className="section-title">
            <List size={18} /> Asesores registrados
            <span className="muted">{asesores.length} en total</span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th className="derecha">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asesores.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.nombre}</strong>
                    </td>
                    <td>{a.correo}</td>
                    <td>{a.telefono}</td>
                    <td>
                      <span className={`pill pill-${a.estado}`}>{a.estado}</span>
                    </td>
                    <td>
                      <div className="acciones">
                        <button
                          className="btn-icon"
                          aria-label={`Editar a ${a.nombre}`}
                          title="Editar"
                          disabled={guardando}
                          onClick={() => {
                            setEditando(a.id);
                            setForm({
                              nombre: a.nombre,
                              correo: a.correo,
                              telefono: a.telefono,
                            });
                            setError("");
                          }}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="btn btn-sm"
                          disabled={guardando}
                          onClick={() => void cambiarEstado(a)}
                        >
                          {a.estado === "activo" ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {asesores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="vacio">
                      Aún no hay asesores registrados.
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
