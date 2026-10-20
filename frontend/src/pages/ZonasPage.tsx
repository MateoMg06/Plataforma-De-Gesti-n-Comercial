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
    <div className="card">
      <Link to="/configuracion">Volver a Configuración</Link>
      <h1 className="page-title">Zonas</h1>
      <p className="muted">
        Crea, edita y elimina zonas. Las zonas en uso no se pueden eliminar.
      </p>
      <form
        onSubmit={crear}
        style={{ display: "flex", gap: 8, margin: "16px 0" }}
      >
        <input
          aria-label="Nombre de la zona"
          required
          maxLength={100}
          disabled={guardando}
          className="input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nueva zona"
        />
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
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {zonas.map((z) => (
          <li
            key={z.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span>{z.nombre}</span>
            <button
              className="btn"
              disabled={guardando}
              onClick={() => {
                setEditando(z.id);
                setNombre(z.nombre);
                setError("");
              }}
            >
              Editar
            </button>
            <button
              className="btn"
              disabled={guardando}
              onClick={() => void eliminar(z)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
