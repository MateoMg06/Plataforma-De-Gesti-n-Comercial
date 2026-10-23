import { Download, FileText, Paperclip, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api, apiDescargarArchivo, apiSubirArchivo, apiTodosLosClientes } from "../api/client";
import "./CotizacionesPage.css";

interface Detalle {
  producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface Cotizacion {
  id: number;
  numero: number;
  idCliente: number;
  idAsesor: number;
  fecha: string;
  estado: string;
  total: number;
  detalles: Detalle[];
  // HU-29: referencia del documento en S3 (null si aún no tiene).
  documentoKey: string | null;
}

interface Linea {
  producto: string;
  cantidad: string;
  precio: string;
}

const lineaVacia: Linea = { producto: "", cantidad: "1", precio: "" };

const pesos = (valor: number) =>
  valor.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

// HU-27 (crear cotización) y HU-28 (cambios de estado). Responsable: Daniel.
// El número, los subtotales y el total los calcula el backend; aquí solo se
// muestra una vista previa mientras se llena el formulario.
export function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [clientes, setClientes] = useState<Record<number, string>>({});
  const [asesores, setAsesores] = useState<{ id: number; nombre: string; estado: string }[]>([]);
  const [idCliente, setIdCliente] = useState("");
  const [idAsesor, setIdAsesor] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([lineaVacia]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  // Evita crear dos cotizaciones con un doble clic.
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    api<Cotizacion[]>("/cotizaciones")
      .then(setCotizaciones)
      .catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
    apiTodosLosClientes<{ id: number; razonSocial: string }>()
      .then((lista) => setClientes(Object.fromEntries(lista.map((c) => [c.id, c.razonSocial]))))
      .catch((e) => setError(e.message));
    api<{ id: number; nombre: string; estado: string }[]>("/asesores")
      .then(setAsesores)
      .catch((e) => setError(e.message));
  }, []);

  const cambiarLinea = (indice: number, campo: keyof Linea, valor: string) =>
    setLineas(lineas.map((l, i) => (i === indice ? { ...l, [campo]: valor } : l)));

  const totalPrevio = lineas.reduce((suma, l) => suma + Number(l.cantidad) * Number(l.precio || 0), 0);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    if (guardando) return;
    setError("");
    setMensaje("");
    setGuardando(true);
    try {
      const nueva = await api<Cotizacion>("/cotizaciones", {
        method: "POST",
        body: JSON.stringify({
          idCliente: Number(idCliente),
          idAsesor: Number(idAsesor),
          detalles: lineas.map((l) => ({
            producto: l.producto,
            cantidad: Number(l.cantidad),
            precio: Number(l.precio),
          })),
        }),
      });
      setIdCliente("");
      setIdAsesor("");
      setLineas([lineaVacia]);
      setMensaje(`Cotización N.º ${nueva.numero} creada en borrador por ${pesos(nueva.total)}.`);
      cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  // HU-28: borrador → enviada → aprobada | rechazada.
  const cambiarEstado = async (c: Cotizacion, accion: "enviar" | "aprobar" | "rechazar") => {
    setError("");
    setMensaje("");
    try {
      await api(`/cotizaciones/${c.id}/${accion}`, { method: "PATCH" });
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // HU-29: el documento se sube a S3; la base guarda solo su referencia.
  const subirDocumento = async (c: Cotizacion, archivo: File | undefined) => {
    if (!archivo) return;
    setError("");
    setMensaje("");
    try {
      await apiSubirArchivo(`/cotizaciones/${c.id}/documento`, "archivo", archivo);
      setMensaje(`Documento de la cotización N.º ${c.numero} guardado.`);
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const descargarDocumento = async (c: Cotizacion) => {
    setError("");
    try {
      await apiDescargarArchivo(`/cotizaciones/${c.id}/documento`, c.documentoKey?.split("/").pop() ?? "documento");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const nombreAsesor = (id: number) => asesores.find((a) => a.id === id)?.nombre ?? `Asesor ${id}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <FileText size={26} /> Cotizaciones
          </h1>
          <p>Crea cotizaciones en borrador y gestiona su estado.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="success">{mensaje}</p>}

      <div className="cotizaciones-layout">
        <form className="card cotizaciones-form" onSubmit={crear}>
          <h2 className="section-title">
            <Plus size={18} /> Nueva cotización
          </h2>
          <label className="field">
            Cliente
            <select className="input" value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required>
              <option value="">Selecciona un cliente</option>
              {Object.entries(clientes).map(([id, nombre]) => (
                <option key={id} value={id}>{nombre}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Asesor
            <select className="input" value={idAsesor} onChange={(e) => setIdAsesor(e.target.value)} required>
              <option value="">Selecciona un asesor</option>
              {asesores.filter((a) => a.estado === "activo").map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </label>

          <strong>Productos</strong>
          {lineas.map((l, i) => (
            <div key={i} className="cotizaciones-linea">
              <input className="input" placeholder="Producto" value={l.producto} onChange={(e) => cambiarLinea(i, "producto", e.target.value)} required />
              <input className="input" type="number" min="1" step="1" placeholder="Cant." value={l.cantidad} onChange={(e) => cambiarLinea(i, "cantidad", e.target.value)} required />
              <input className="input" type="number" min="1" step="any" placeholder="Precio" value={l.precio} onChange={(e) => cambiarLinea(i, "precio", e.target.value)} required />
              <button type="button" className="btn-icon" aria-label="Quitar producto" disabled={lineas.length === 1} onClick={() => setLineas(lineas.filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={() => setLineas([...lineas, lineaVacia])}>
            <Plus size={16} /> Agregar producto
          </button>
          <p className="cotizaciones-total">
            Total estimado: <strong>{pesos(totalPrevio)}</strong>
          </p>
          <button className="btn btn-primary" disabled={guardando}>
            {guardando ? "Guardando…" : "Crear cotización"}
          </button>
        </form>

        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Cliente</th>
                  <th>Asesor</th>
                  <th>Productos</th>
                  <th className="derecha">Total</th>
                  <th>Estado</th>
                  <th className="derecha">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="vacio">Aún no hay cotizaciones.</td>
                  </tr>
                ) : (
                  cotizaciones.map((c) => (
                    <tr key={c.id}>
                      <td>{c.numero}</td>
                      <td>{clientes[c.idCliente] ?? `Cliente ${c.idCliente}`}</td>
                      <td>{nombreAsesor(c.idAsesor)}</td>
                      <td>{c.detalles.map((d) => `${d.cantidad} × ${d.producto}`).join(", ")}</td>
                      <td className="derecha">{pesos(c.total)}</td>
                      <td><span className={`pill pill-${c.estado}`}>{c.estado}</span></td>
                      <td className="derecha">
                        {/* Un td con display: flex deja de ser celda y descuadra la fila: el flex va en un div. */}
                        <div className="cotizaciones-acciones">
                        {c.estado === "borrador" && (
                          <button className="btn btn-sm" onClick={() => void cambiarEstado(c, "enviar")}>Enviar</button>
                        )}
                        {c.estado === "enviada" && (
                          <>
                            <button className="btn btn-sm btn-primary" onClick={() => void cambiarEstado(c, "aprobar")}>Aprobar</button>
                            <button className="btn btn-sm" onClick={() => void cambiarEstado(c, "rechazar")}>Rechazar</button>
                          </>
                        )}
                        {/* HU-29: documento de la cotización (PDF o imagen, máximo 10 MB). */}
                        {c.documentoKey && (
                          <button className="btn-icon" aria-label={`Descargar documento de la cotización ${c.numero}`} title="Descargar documento" onClick={() => void descargarDocumento(c)}>
                            <Download size={18} />
                          </button>
                        )}
                        {/* El input no usa "hidden": así se puede elegir con el teclado (Tab + Enter). */}
                        <label className="btn-icon cotizaciones-adjuntar" title={c.documentoKey ? "Reemplazar documento" : "Adjuntar documento"}>
                          <Paperclip size={18} />
                          <input
                            type="file"
                            accept="application/pdf,image/png,image/jpeg"
                            className="cotizaciones-archivo"
                            aria-label={`Adjuntar documento a la cotización ${c.numero}`}
                            onChange={(e) => {
                              void subirDocumento(c, e.target.files?.[0]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
