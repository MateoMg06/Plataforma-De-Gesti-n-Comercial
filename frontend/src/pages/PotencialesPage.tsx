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
    <div className="card">
      <Link to="/configuracion">Volver a Configuración</Link>
      <h1 className="page-title">Potenciales</h1>
      <p className="muted">
        Crea, edita y elimina opciones. Las opciones en uso no se pueden
        eliminar.
      </p>
      <form
        onSubmit={crear}
        style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0" }}
      >
        <input
          aria-label="Nombre del potencial"
          required
          maxLength={100}
          disabled={guardando}
          className="input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
        />
        <input
          aria-label="Orden"
          className="input"
          type="number"
          min="0"
          max="2147483647"
          step="1"
          required
          disabled={guardando}
          placeholder="Orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
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
              setOrden("");
            }}
          >
            Cancelar
          </button>
        )}
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {opciones.map((z) => (
          <li
            key={z.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span>
              {z.orden} · {z.nombre}
            </span>
            <button
              className="btn"
              disabled={guardando}
              onClick={() => {
                setEditando(z.id);
                setNombre(z.nombre);
                setOrden(String(z.orden));
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
