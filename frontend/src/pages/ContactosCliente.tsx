import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";

const vacio = {
  nombre: "",
  cargo: "",
  telefono: "",
  celular: "",
  email: "",
  principal: false,
};
type Contacto = { id: number; idCliente: number; datos: typeof vacio };

export function ContactosCliente({
  idCliente,
  nombre,
}: {
  idCliente: number;
  nombre: string;
}) {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [datos, setDatos] = useState(vacio);
  const [id, setId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const ruta = `/clientes/${idCliente}/contactos`;
  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError("");
    api<Contacto[]>(ruta)
      .then((res) => {
        if (vigente) setContactos(res);
      })
      .catch((err) => {
        if (vigente) setError((err as Error).message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [ruta, recarga]);
  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setError("");
    setAviso("");
    try {
      await api(id === null ? ruta : `${ruta}/${id}`, {
        method: id === null ? "POST" : "PUT",
        body: JSON.stringify(datos),
      });
      setDatos(vacio);
      setId(null);
      setAviso("Contacto guardado.");
      setRecarga((v) => v + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }
  async function eliminar(contacto: Contacto) {
    if (guardando || !window.confirm(`¿Eliminar a ${contacto.datos.nombre}?`))
      return;
    setGuardando(true);
    setError("");
    setAviso("");
    try {
      await api(`${ruta}/${contacto.id}`, { method: "DELETE" });
      if (id === contacto.id) {
        setId(null);
        setDatos(vacio);
      }
      setAviso("Contacto eliminado.");
      setRecarga((v) => v + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }
  return (
    <section className="card" aria-label={`Contactos de ${nombre}`}>
      <h2>Contactos de {nombre}</h2>
      <p>
        Solo puede haber un contacto principal. Desmarca el actual antes de
        asignar otro.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {aviso && (
        <p className="success" role="status">
          {aviso}
        </p>
      )}
      {cargando ? (
        <p role="status">Cargando contactos…</p>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Teléfono</th>
                  <th>Celular</th>
                  <th>Email</th>
                  <th>Principal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contactos.map((c) => (
                  <tr key={c.id}>
                    <td>{c.datos.nombre}</td>
                    <td>{c.datos.cargo}</td>
                    <td>{c.datos.telefono}</td>
                    <td>{c.datos.celular}</td>
                    <td>{c.datos.email}</td>
                    <td>{c.datos.principal ? "Sí" : "No"}</td>
                    <td>
                      <div className="acciones">
                        <button
                          className="btn"
                          disabled={guardando}
                          onClick={() => {
                            setId(c.id);
                            setDatos(c.datos);
                            setAviso("");
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="btn"
                          disabled={guardando}
                          onClick={() => void eliminar(c)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {contactos.length === 0 && (
                  <tr>
                    <td colSpan={7}>No hay contactos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      <button
        className="btn"
        disabled={guardando || cargando}
        onClick={() => setRecarga((v) => v + 1)}
      >
        Actualizar contactos
      </button>
      <h3>{id === null ? "Nuevo contacto" : "Editar contacto"}</h3>
      <form onSubmit={guardar}>
        <fieldset disabled={guardando || cargando} className="stack">
          <div className="form-grid">
            {(
              [
                ["nombre", "Nombre", 200],
                ["cargo", "Cargo", 100],
                ["telefono", "Teléfono", 30],
                ["celular", "Celular", 30],
                ["email", "Email", 254],
              ] as const
            ).map(([campo, etiqueta, max]) => (
              <label className="field" key={campo}>
                {etiqueta}
                {campo === "nombre" ? " *" : ""}
                <input
                  className="input"
                  required={campo === "nombre"}
                  maxLength={max}
                  type={
                    campo === "email"
                      ? "email"
                      : campo === "telefono" || campo === "celular"
                        ? "tel"
                        : "text"
                  }
                  value={datos[campo]}
                  onChange={(e) =>
                    setDatos({ ...datos, [campo]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
          <label>
            <input
              type="checkbox"
              checked={datos.principal}
              onChange={(e) =>
                setDatos({ ...datos, principal: e.target.checked })
              }
            />{" "}
            Contacto principal
          </label>
          <div className="form-actions">
            <button className="btn btn-primary">
              {guardando ? "Guardando…" : "Guardar contacto"}
            </button>
            {id !== null && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setId(null);
                  setDatos(vacio);
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </section>
  );
}
