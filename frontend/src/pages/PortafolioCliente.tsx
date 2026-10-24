import { Briefcase, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";

interface Portafolio {
  id: number;
  nombre: string;
  descripcion: string;
}

interface PortafolioDeCliente {
  idPortafolio: number;
  nombre: string;
  descripcion: string;
  fechaRegistro: string;
}

// HU-09: líneas del portafolio que tiene el cliente que se está editando.
// Se agregan y se retiran; cada una guarda su fecha de registro.
export function PortafolioCliente({ idCliente }: { idCliente: number }) {
  const [asignados, setAsignados] = useState<PortafolioDeCliente[]>([]);
  const [catalogo, setCatalogo] = useState<Portafolio[]>([]);
  const [seleccion, setSeleccion] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSeleccion("");
    setError("");
    api<PortafolioDeCliente[]>(`/clientes/${idCliente}/portafolio`)
      .then(setAsignados)
      .catch((e) => setError(e.message));
    api<Portafolio[]>("/portafolios")
      .then(setCatalogo)
      .catch((e) => setError(e.message));
  }, [idCliente]);

  const agregar = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // El backend responde con el portafolio actualizado del cliente.
      setAsignados(
        await api<PortafolioDeCliente[]>(`/clientes/${idCliente}/portafolio`, {
          method: "POST",
          body: JSON.stringify({ idPortafolio: Number(seleccion) }),
        }),
      );
      setSeleccion("");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const retirar = async (p: PortafolioDeCliente) => {
    if (!confirm(`¿Retirar ${p.nombre} del portafolio del cliente?`)) return;
    setError("");
    try {
      setAsignados(
        await api<PortafolioDeCliente[]>(`/clientes/${idCliente}/portafolio/${p.idPortafolio}`, {
          method: "DELETE",
        }),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // En la lista para agregar solo salen las líneas que el cliente aún no tiene.
  const disponibles = catalogo.filter((p) => !asignados.some((a) => a.idPortafolio === p.id));

  return (
    <div className="contactos">
      <h3 className="section-title">
        <Briefcase size={18} /> Portafolio
      </h3>
      {error && <p className="error">{error}</p>}

      {asignados.length === 0 ? (
        <p className="muted">Este cliente aún no tiene líneas del portafolio.</p>
      ) : (
        <ul className="contactos-lista">
          {asignados.map((p) => (
            <li key={p.idPortafolio}>
              <span>
                <strong>{p.nombre}</strong>
                <br />
                <span className="muted">
                  {[p.descripcion, `Desde ${new Date(p.fechaRegistro).toLocaleDateString("es-CO", { dateStyle: "medium" })}`]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <button
                type="button"
                className="btn-icon danger"
                aria-label={`Retirar ${p.nombre}`}
                title="Retirar"
                onClick={() => void retirar(p)}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="toolbar" onSubmit={agregar}>
        <label className="field">
          Línea del portafolio
          <select className="input" value={seleccion} onChange={(e) => setSeleccion(e.target.value)} required>
            <option value="">Selecciona una línea</option>
            {disponibles.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-outline btn-sm" disabled={!seleccion}>
          <Plus size={16} /> Agregar
        </button>
      </form>
    </div>
  );
}
