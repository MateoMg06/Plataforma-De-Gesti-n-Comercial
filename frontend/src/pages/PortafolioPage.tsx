import { Briefcase, ChevronRight, List, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Portafolio {
  id: number;
  nombre: string;
  descripcion: string;
}

const vacio = { nombre: "", descripcion: "" };

// HU-09: catálogo de portafolio. Mismo patrón que los demás catálogos (HU-08).
export function PortafolioPage() {
  const [portafolios, setPortafolios] = useState<Portafolio[]>([]);
  const [datos, setDatos] = useState(vacio);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    api<Portafolio[]>("/portafolios")
      .then(setPortafolios)
      .catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
  }, []);

  const cancelar = () => {
    setEditando(null);
    setDatos(vacio);
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await api(editando === null ? "/portafolios" : `/portafolios/${editando}`, {
        method: editando === null ? "POST" : "PATCH",
        body: JSON.stringify(datos),
      });
      cancelar();
      await cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (p: Portafolio) => {
    if (!window.confirm(`¿Eliminar ${p.nombre} del portafolio?`)) return;
    setError("");
    setGuardando(true);
    try {
      await api(`/portafolios/${p.id}`, { method: "DELETE" });
      if (editando === p.id) cancelar();
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
        <span>Portafolio</span>
      </nav>
      <div className="page-header">
        <div>
          <h1>
            <Briefcase size={26} /> Portafolio
          </h1>
          <p>
            Líneas de productos o servicios que se ofrecen a los clientes. Las
            que tienen clientes asignados no se pueden eliminar.
          </p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="stack">
        <form className="card" onSubmit={guardar}>
          <h2 className="section-title">
            {editando === null ? <Plus size={18} /> : <Pencil size={18} />}
            {editando === null ? "Nueva línea" : "Editar línea"}
          </h2>
          <div className="toolbar">
            <label className="field">
              Nombre
              <input
                required
                maxLength={100}
                disabled={guardando}
                className="input"
                value={datos.nombre}
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                placeholder="Ej: Equipos de soldadura"
              />
            </label>
            <label className="field">
              Descripción
              <input
                maxLength={255}
                disabled={guardando}
                className="input"
                value={datos.descripcion}
                onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
                placeholder="Ej: Soldadoras, electrodos y accesorios"
              />
            </label>
            <div className="form-actions">
              <button disabled={guardando} className="btn btn-primary">
                {guardando ? "Guardando…" : editando === null ? "Agregar" : "Guardar"}
              </button>
              {editando !== null && (
                <button type="button" className="btn" disabled={guardando} onClick={cancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>
        <div className="card">
          <h2 className="section-title">
            <List size={18} /> Líneas del portafolio
            <span className="muted">{portafolios.length} en total</span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th className="derecha">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {portafolios.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.nombre}</strong></td>
                    <td>{p.descripcion || "—"}</td>
                    <td>
                      <div className="acciones">
                        <button
                          className="btn-icon"
                          aria-label={`Editar ${p.nombre}`}
                          title="Editar"
                          disabled={guardando}
                          onClick={() => {
                            setEditando(p.id);
                            setDatos({ nombre: p.nombre, descripcion: p.descripcion });
                            setError("");
                          }}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="btn-icon danger"
                          aria-label={`Eliminar ${p.nombre}`}
                          title="Eliminar"
                          disabled={guardando}
                          onClick={() => void eliminar(p)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {portafolios.length === 0 && (
                  <tr>
                    <td colSpan={3} className="vacio">Aún no hay líneas en el portafolio.</td>
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
