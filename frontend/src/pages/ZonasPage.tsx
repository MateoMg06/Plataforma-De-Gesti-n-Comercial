import { ChevronRight, List, MapPinned, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Zona {
  id: number;
  nombre: string;
}

// Ejemplo de pantalla conectada al backend (módulo zonas). Úsenla como referencia.
export function ZonasPage() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    api<Zona[]>("/zonas")
      .then(setZonas)
      .catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await api(editando === null ? "/zonas" : `/zonas/${editando}`, {
        method: editando === null ? "POST" : "PATCH",
        body: JSON.stringify({ nombre }),
      });
      setEditando(null);
      setNombre("");
      await cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (zona: Zona) => {
    if (!window.confirm(`¿Eliminar la zona ${zona.nombre}?`)) return;
    setError("");
    setGuardando(true);
    try {
      await api(`/zonas/${zona.id}`, { method: "DELETE" });
      if (editando === zona.id) {
        setEditando(null);
        setNombre("");
      }
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
        <span>Zonas</span>
      </nav>
      <div className="page-header">
        <div>
          <h1>
            <MapPinned size={26} /> Zonas
          </h1>
          <p>
            Crea, edita y elimina zonas. Las zonas en uso no se pueden eliminar.
          </p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="stack">
        <form className="card" onSubmit={crear}>
          <h2 className="section-title">
            {editando === null ? <Plus size={18} /> : <Pencil size={18} />}
            {editando === null ? "Nueva zona" : "Editar zona"}
          </h2>
          <div className="toolbar">
            <label className="field">
              Nombre de la zona
              <input
                required
                maxLength={100}
                disabled={guardando}
                className="input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Norte"
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
                  onClick={() => {
                    setEditando(null);
                    setNombre("");
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>
        <div className="card">
          <h2 className="section-title">
            <List size={18} /> Zonas registradas
            <span className="muted">{zonas.length} en total</span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th className="derecha">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {zonas.map((z) => (
                  <tr key={z.id}>
                    <td>{z.nombre}</td>
                    <td>
                      <div className="acciones">
                        <button
                          className="btn-icon"
                          aria-label={`Editar ${z.nombre}`}
                          title="Editar"
                          disabled={guardando}
                          onClick={() => {
                            setEditando(z.id);
                            setNombre(z.nombre);
                            setError("");
                          }}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="btn-icon danger"
                          aria-label={`Eliminar ${z.nombre}`}
                          title="Eliminar"
                          disabled={guardando}
                          onClick={() => void eliminar(z)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {zonas.length === 0 && (
                  <tr>
                    <td colSpan={2} className="vacio">
                      Aún no hay zonas.
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
