import { Eye, FileText, List, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";

interface Pedido {
  id: number;
  numero: number;
  idCotizacion: number;
  idCliente: number;
  valor: number;
  estado: string;
  fecha: string;
}

interface DetallePedido extends Pedido {
  cotizacionOrigen: {
    numero: number;
    estado: string;
    fecha: string;
    total: number;
    detalles: { producto: string; cantidad: number; precio: number; subtotal: number }[];
  } | null;
}

interface Opcion {
  id: number;
  nombre: string;
}

const ESTADOS = ["pendiente", "confirmado", "entregado", "cancelado"];
const filtrosVacios = { idCliente: "", idAsesor: "", estado: "", desde: "", hasta: "" };

const pesos = (valor: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
const fecha = (texto: string) =>
  new Date(texto).toLocaleDateString("es-CO", { dateStyle: "medium" });

// HU-31 (Daniel): consultar pedidos con filtros y ver su cotización de origen.
export function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Opcion[]>([]);
  const [asesores, setAsesores] = useState<Opcion[]>([]);
  // Cotización -> número y asesor, para mostrar de quién es cada pedido.
  const [cotizaciones, setCotizaciones] = useState<Record<number, { numero: number; idAsesor: number }>>({});
  const [rol, setRol] = useState("");
  const [filtros, setFiltros] = useState(filtrosVacios);
  const [detalle, setDetalle] = useState<DetallePedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const buscar = (valores: typeof filtrosVacios) => {
    setCargando(true);
    setError("");
    const params = new URLSearchParams();
    for (const [campo, valor] of Object.entries(valores)) if (valor) params.set(campo, valor);
    api<Pedido[]>(`/pedidos?${params}`)
      .then(setPedidos)
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    buscar(filtrosVacios);
    api<{ user: { role: string } } | null>("/auth/get-session")
      .then((datos) => setRol(datos?.user.role ?? ""))
      .catch(() => setRol(""));
    api<{ datos: { id: number; razonSocial: string }[] }>("/clientes?limit=100")
      .then((pagina) => setClientes(pagina.datos.map((c) => ({ id: c.id, nombre: c.razonSocial }))))
      .catch((e) => setError((e as Error).message));
    api<Opcion[]>("/asesores")
      .then(setAsesores)
      .catch((e) => setError((e as Error).message));
    api<{ id: number; numero: number; idAsesor: number }[]>("/cotizaciones")
      .then((lista) => setCotizaciones(Object.fromEntries(lista.map((c) => [c.id, c]))))
      .catch((e) => setError((e as Error).message));
  }, []);

  const aplicar = (e: FormEvent) => {
    e.preventDefault();
    setDetalle(null);
    buscar(filtros);
  };

  const verDetalle = (pedido: Pedido) => {
    setError("");
    api<DetallePedido>(`/pedidos/${pedido.id}`)
      .then((datos) => {
        setDetalle(datos);
        setTimeout(() => document.getElementById("detalle-pedido")?.scrollIntoView({ behavior: "smooth" }), 0);
      })
      .catch((e) => setError((e as Error).message));
  };

  const nombre = (lista: Opcion[], id: number | undefined) =>
    lista.find((x) => x.id === id)?.nombre ?? (id ? `#${id}` : "—");
  const total = pedidos.reduce((suma, p) => suma + Number(p.valor), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <ShoppingCart size={26} /> Pedidos
          </h1>
          <p>Consulta los pedidos generados a partir de cotizaciones aprobadas.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stack">
        <section className="card">
          <form className="toolbar" onSubmit={aplicar}>
            <label className="field">
              Cliente
              <select className="input" value={filtros.idCliente} onChange={(e) => setFiltros({ ...filtros, idCliente: e.target.value })}>
                <option value="">Todos</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </label>
            {/* El asesor solo ve sus pedidos: a él no se le muestra este filtro. */}
            {rol !== "asesor" && (
              <label className="field">
                Asesor
                <select className="input" value={filtros.idAsesor} onChange={(e) => setFiltros({ ...filtros, idAsesor: e.target.value })}>
                  <option value="">Todos</option>
                  {asesores.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="field">
              Estado
              <select className="input" value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
                <option value="">Todos</option>
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>{estado[0].toUpperCase() + estado.slice(1)}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Desde
              <input className="input" type="date" value={filtros.desde} onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })} />
            </label>
            <label className="field">
              Hasta
              <input
                className="input"
                type="date"
                min={filtros.desde || undefined}
                value={filtros.hasta}
                onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary">
                <Search size={18} /> Buscar
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setFiltros(filtrosVacios);
                  setDetalle(null);
                  buscar(filtrosVacios);
                }}
              >
                Limpiar
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2 className="section-title">
            <List size={18} /> Pedidos
            <span className="muted">
              {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"} · {pesos(total)}
            </span>
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Asesor</th>
                  <th>Cotización</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th className="derecha">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td><strong>PED-{p.numero}</strong></td>
                    <td>{fecha(p.fecha)}</td>
                    <td>{nombre(clientes, p.idCliente)}</td>
                    <td>{nombre(asesores, cotizaciones[p.idCotizacion]?.idAsesor)}</td>
                    <td>COT-{cotizaciones[p.idCotizacion]?.numero ?? p.idCotizacion}</td>
                    <td>{pesos(Number(p.valor))}</td>
                    <td>
                      <span className={`pill pill-${p.estado}`}>{p.estado}</span>
                    </td>
                    <td>
                      <div className="acciones">
                        <button className="btn-icon" aria-label={`Ver detalle del pedido ${p.numero}`} title="Ver detalle" onClick={() => verDetalle(p)}>
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!cargando && pedidos.length === 0 && (
                  <tr>
                    <td colSpan={8} className="vacio">No hay pedidos con estos filtros.</td>
                  </tr>
                )}
                {cargando && (
                  <tr>
                    <td colSpan={8} className="vacio">Cargando pedidos…</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {detalle && (
          <section className="card" id="detalle-pedido">
            <h2 className="section-title">
              <FileText size={18} /> Pedido PED-{detalle.numero}
              {detalle.cotizacionOrigen && <> · cotización de origen COT-{detalle.cotizacionOrigen.numero}</>}
              <button className="btn-icon" aria-label="Cerrar detalle" onClick={() => setDetalle(null)}>
                <X size={18} />
              </button>
            </h2>
            {detalle.cotizacionOrigen ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th className="derecha">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.cotizacionOrigen.detalles.map((d, i) => (
                      <tr key={i}>
                        <td>{d.producto}</td>
                        <td>{d.cantidad}</td>
                        <td>{pesos(Number(d.precio))}</td>
                        <td className="derecha">{pesos(Number(d.subtotal))}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3}><strong>Total</strong></td>
                      <td className="derecha"><strong>{pesos(Number(detalle.cotizacionOrigen.total))}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">No se encontró la cotización de origen.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
