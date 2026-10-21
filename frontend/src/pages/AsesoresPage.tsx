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
    <div className="card">
      <Link to="/configuracion">Volver a Configuración</Link>
      <h1 className="page-title">Asesores</h1>
      <p className="muted">
        Los asesores inactivos no reciben rutas nuevas. El correo no se puede
        repetir.
      </p>
      <form
        onSubmit={guardar}
        style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0" }}
      >
        <input
          aria-label="Nombre"
          required
          maxLength={100}
          disabled={guardando}
          className="input"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          placeholder="Nombre"
        />
        <input
          aria-label="Correo"
          required
          type="email"
          maxLength={150}
          disabled={guardando}
          className="input"
          value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
          placeholder="Correo"
        />
        <input
          aria-label="Teléfono"
          required
          maxLength={20}
          disabled={guardando}
          className="input"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          placeholder="Teléfono"
        />
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
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {asesores.map((a) => (
          <li
            key={a.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span>
              <strong>{a.nombre}</strong> · {a.correo} · {a.telefono}
            </span>
            <span className="muted">({a.estado})</span>
            <button
              className="btn"
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
              Editar
            </button>
            <button
              className="btn"
              disabled={guardando}
              onClick={() => void cambiarEstado(a)}
            >
              {a.estado === "activo" ? "Inactivar" : "Activar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
