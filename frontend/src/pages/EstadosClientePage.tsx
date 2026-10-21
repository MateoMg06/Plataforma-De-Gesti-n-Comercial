import { ChevronRight, CircleCheck, List, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Opcion {
  id: number;
  nombre: string;
}

// Catálogo independiente de HU-08, siguiendo la pantalla de opciones.
export function EstadosClientePage() {
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    api<Opcion[]>("/estados-cliente")
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
        editando === null ? "/estados-cliente" : `/estados-cliente/${editando}`,
        {
          method: editando === null ? "POST" : "PATCH",
          body: JSON.stringify({ nombre }),
        },
      );
      setEditando(null);
      setNombre("");
      await cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (opcion: Opcion) => {
    if (!window.confirm(`¿Eliminar el estado de cliente ${opcion.nombre}?`))
      return;
    setError("");
    setGuardando(true);
    try {
      await api(`/estados-cliente/${opcion.id}`, { method: "DELETE" });
      if (editando === opcion.id) {
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
        <span>Estados de cliente</span>
      </nav>
      <div className="page-header">
        <div>
          <h1>
            <CircleCheck size={26} /> Estados de cliente
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
            {editando === null ? "Nuevo estado de cliente" : "Editar estado de cliente"}
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
                placeholder="Ej: Activo"
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
            <List size={18} /> Estados registrados
            <span className="muted">{opciones.length} en total</span>
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
                {opciones.map((z) => (
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
                {opciones.length === 0 && (
                  <tr>
                    <td colSpan={2} className="vacio">
                      Aún no hay estados de cliente.
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
