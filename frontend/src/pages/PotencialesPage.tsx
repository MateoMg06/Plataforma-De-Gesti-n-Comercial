import { ChevronRight, List, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Opcion {
  id: number;
  nombre: string;
  orden: number;
}

// Catálogo independiente de HU-08, siguiendo la pantalla de opciones.
export function PotencialesPage() {
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState("");
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    api<Opcion[]>("/potenciales")
      .then(setOpciones)
      .catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await api(
        editando === null ? "/potenciales" : `/potenciales/${editando}`,
        {
          method: editando === null ? "POST" : "PATCH",
          body: JSON.stringify({ nombre, orden: Number(orden) }),
        },
      );
      setEditando(null);
      setNombre("");
      setOrden("");
      await cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (opcion: Opcion) => {
    if (!window.confirm(`¿Eliminar el potencial ${opcion.nombre}?`)) return;
    setError("");
    setGuardando(true);
    try {
      await api(`/potenciales/${opcion.id}`, { method: "DELETE" });
      if (editando === opcion.id) {
        setEditando(null);
        setNombre("");
        setOrden("");
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
        <span>Potenciales</span>
      </nav>
      <div className="page-header">
        <div>
          <h1>
            <TrendingUp size={26} /> Potenciales
          </h1>
          <p>
            Crea, edita y elimina opciones. Las opciones en uso no se pueden
            eliminar.
          </p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="stack">
        <form className="card" onSubmit={crear}>
          <h2 className="section-title">
            {editando === null ? <Plus size={18} /> : <Pencil size={18} />}
            {editando === null ? "Nuevo potencial" : "Editar potencial"}
          </h2>
          <div className="toolbar">
            <label className="field">
              Nombre
              <input
                required
                maxLength={100}
                disabled={guardando}
                className="input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Alto"
              />
            </label>
            <label className="field">
              Orden
              <input
                className="input"
                type="number"
                min="0"
                max="2147483647"
                step="1"
                required
                disabled={guardando}
                placeholder="Ej: 1"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
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
                    setOrden("");
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
            <List size={18} /> Potenciales registrados
            <span className="muted">{opciones.length} en total</span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Nombre</th>
                  <th className="derecha">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {opciones.map((z) => (
                  <tr key={z.id}>
                    <td>
                      <span className="num">{z.orden}</span>
                    </td>
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
                            setOrden(String(z.orden));
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
                {opciones.length === 0 && (
                  <tr>
                    <td colSpan={3} className="vacio">
                      Aún no hay potenciales.
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
