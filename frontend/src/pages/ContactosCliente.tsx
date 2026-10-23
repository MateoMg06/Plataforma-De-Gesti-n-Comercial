import { Pencil, Phone, Star, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";

interface Contacto {
  id: number;
  nombre: string;
  cargo: string;
  telefono: string;
  celular: string;
  email: string;
  esPrincipal: boolean;
}

const vacio = { nombre: "", cargo: "", telefono: "", celular: "", email: "", esPrincipal: false };

// HU-07: contactos del cliente que se está editando. Solo uno puede ser principal
// (la regla la valida el backend y aquí se muestra su mensaje).
export function ContactosCliente({ idCliente }: { idCliente: number }) {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [datos, setDatos] = useState(vacio);
  const [editando, setEditando] = useState<number | null>(null);
  const [error, setError] = useState("");
  // Evita guardar dos veces el mismo contacto con un doble clic.
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    api<Contacto[]>(`/clientes/${idCliente}/contactos`)
      .then(setContactos)
      .catch((e) => setError(e.message));

  useEffect(() => {
    setDatos(vacio);
    setEditando(null);
    setError("");
    cargar();
  }, [idCliente]);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (guardando) return;
    setError("");
    setGuardando(true);
    try {
      await api(
        editando === null
          ? `/clientes/${idCliente}/contactos`
          : `/clientes/${idCliente}/contactos/${editando}`,
        { method: editando === null ? "POST" : "PUT", body: JSON.stringify(datos) },
      );
      setDatos(vacio);
      setEditando(null);
      cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const editar = (c: Contacto) => {
    setEditando(c.id);
    setDatos({
      nombre: c.nombre,
      cargo: c.cargo,
      telefono: c.telefono,
      celular: c.celular,
      email: c.email,
      esPrincipal: c.esPrincipal,
    });
  };

  const eliminar = async (c: Contacto) => {
    if (!confirm(`¿Eliminar el contacto ${c.nombre}?`)) return;
    setError("");
    try {
      await api(`/clientes/${idCliente}/contactos/${c.id}`, { method: "DELETE" });
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const campo = (clave: "nombre" | "cargo" | "telefono" | "celular" | "email", etiqueta: string, tipo = "text") => (
    <label className="field">
      {etiqueta}
      <input
        className="input"
        type={tipo}
        value={datos[clave]}
        onChange={(e) => setDatos({ ...datos, [clave]: e.target.value })}
        required={clave === "nombre" || clave === "email"}
      />
    </label>
  );

  return (
    <div className="contactos">
      <h3 className="section-title">
        <Phone size={18} /> Contactos
      </h3>
      {error && <p className="error">{error}</p>}

      {contactos.length === 0 ? (
        <p className="muted">Este cliente aún no tiene contactos.</p>
      ) : (
        <ul className="contactos-lista">
          {contactos.map((c) => (
            <li key={c.id}>
              <span>
                <strong>{c.nombre}</strong> {c.esPrincipal && <span className="pill pill-activa"><Star size={12} /> principal</span>}
                <br />
                <span className="muted">
                  {[c.cargo, c.telefono, c.celular, c.email].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span>
                <button type="button" className="btn-icon" aria-label="Editar contacto" onClick={() => editar(c)}>
                  <Pencil size={16} />
                </button>
                <button type="button" className="btn-icon" aria-label="Eliminar contacto" onClick={() => void eliminar(c)}>
                  <Trash2 size={16} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <form className="toolbar" onSubmit={guardar}>
        {campo("nombre", "Nombre")}
        {campo("cargo", "Cargo")}
        {campo("telefono", "Teléfono")}
        {campo("celular", "Celular")}
        {campo("email", "Email", "email")}
        <label className="contactos-principal">
          <input
            type="checkbox"
            checked={datos.esPrincipal}
            onChange={(e) => setDatos({ ...datos, esPrincipal: e.target.checked })}
          />
          Principal
        </label>
        {editando !== null && (
          <button type="button" className="btn btn-sm" onClick={() => { setEditando(null); setDatos(vacio); }}>
            Cancelar
          </button>
        )}
        <button className="btn btn-outline btn-sm" disabled={guardando}>
          {guardando ? "Guardando…" : editando === null ? "Agregar contacto" : "Guardar contacto"}
        </button>
      </form>
    </div>
  );
}
