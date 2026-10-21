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
    <div className="card">
      <Link to="/configuracion">Volver a Configuración</Link>
      <h1 className="page-title">Estados de cliente</h1>
      <p className="muted">
        Crea, edita y elimina opciones. Las opciones en uso no se pueden
        eliminar.
      </p>
      <form
        onSubmit={crear}
        style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0" }}
      >
        <input
          aria-label="Nombre del estado de cliente"
          required
          maxLength={100}
          disabled={guardando}
          className="input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
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
