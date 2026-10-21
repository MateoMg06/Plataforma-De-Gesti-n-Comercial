import {
  CalendarCheck,
  FileText,
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import "./DashboardPage.css";

interface Kpis {
  visitas: { realizadas: number; programadas: number };
  cotizacionesPorEstado: {
    borrador: number;
    enviada: number;
    aprobada: number;
    rechazada: number;
  };
  valorCotizadoPorAsesor: {
    idAsesor: number;
    nombreAsesor: string;
    valorCotizado: number;
  }[];
  pedidosPorAsesor: {
    idAsesor: number;
    nombreAsesor: string;
    pedidos: number;
  }[];
  clientesPorPotencial: { potencial: string; clientes: number }[];
  idAsesorFiltrado: number | null;
}

interface Asesor {
  id: number;
  nombre: string;
}

const pesos = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);

// HU-32: dashboard de KPIs. Los datos se cargan al montar la pantalla y
// cuando cambia el asesor seleccionado (HU-32: el asesor ve solo lo suyo).
export function DashboardPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [idAsesor, setIdAsesor] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // El selector de asesor se alimenta de los asesores reales (GET /asesores).
    api<Asesor[]>("/asesores")
      .then(setAsesores)
      .catch(() => setAsesores([]));
  }, []);

  useEffect(() => {
    setCargando(true);
    setError("");
    const consulta = idAsesor === null ? "" : `?idAsesor=${idAsesor}`;
    api<Kpis>(`/dashboard/kpis${consulta}`)
      .then(setKpis)
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  }, [idAsesor]);

  const totalValorCotizado = (kpis?.valorCotizadoPorAsesor ?? []).reduce(
    (suma, fila) => suma + fila.valorCotizado,
    0,
  );
  const maxClientes = Math.max(
    1,
    ...(kpis?.clientesPorPotencial ?? []).map((fila) => fila.clientes),
  );

  const estados: { etiqueta: string; valor: number; clase: string }[] = kpis
    ? [
        { etiqueta: "Borrador", valor: kpis.cotizacionesPorEstado.borrador, clase: "borrador" },
        { etiqueta: "Enviada", valor: kpis.cotizacionesPorEstado.enviada, clase: "enviada" },
        { etiqueta: "Aprobada", valor: kpis.cotizacionesPorEstado.aprobada, clase: "aprobada" },
        { etiqueta: "Rechazada", valor: kpis.cotizacionesPorEstado.rechazada, clase: "rechazada" },
      ]
    : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <LayoutDashboard size={26} /> Dashboard
          </h1>
          <p>
            Indicadores comerciales de Comercial 360. Se actualizan al cargar la
            pantalla.
          </p>
        </div>
        <div className="page-actions">
          <label className="field kpi-filtro">
            Ver como asesor
            <select
              className="input"
              value={idAsesor ?? ""}
              onChange={(e) =>
                setIdAsesor(e.target.value === "" ? null : Number(e.target.value))
              }
            >
              <option value="">Todos (administrador / líder)</option>
              {asesores.map((asesor) => (
                <option key={asesor.id} value={asesor.id}>
                  {asesor.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {cargando && !kpis && (
        <div className="card">
          <p className="muted">Cargando indicadores…</p>
        </div>
      )}

      {kpis && (
        <>
          <div className="kpi-grid">
            <section className="kpi-card card">
              <h2 className="section-title">
                <CalendarCheck size={18} /> Visitas
              </h2>
              <div className="kpi-stats">
                <div className="kpi-stat">
                  <span className="kpi-num kpi-ok">{kpis.visitas.realizadas}</span>
                  <span className="kpi-etiqueta">Realizadas</span>
                </div>
                <div className="kpi-stat">
                  <span className="kpi-num kpi-alerta">{kpis.visitas.programadas}</span>
                  <span className="kpi-etiqueta">Programadas</span>
                </div>
              </div>
            </section>

            <section className="kpi-card card">
              <h2 className="section-title">
                <FileText size={18} /> Cotizaciones por estado
                <span className="chip-muestra">muestra</span>
              </h2>
              <ul className="kpi-lista">
                {estados.map((estado) => (
                  <li key={estado.clase}>
                    <span className={`kpi-estado kpi-estado-${estado.clase}`}>
                      {estado.etiqueta}
                    </span>
                    <strong>{estado.valor}</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section className="kpi-card card">
              <h2 className="section-title">
                <TrendingUp size={18} /> Valor cotizado
                <span className="chip-muestra">muestra</span>
              </h2>
              <span className="kpi-num kpi-total">{pesos(totalValorCotizado)}</span>
              <ul className="kpi-lista">
                {kpis.valorCotizadoPorAsesor.length === 0 && (
                  <li className="muted">Sin cotizaciones para mostrar.</li>
                )}
                {kpis.valorCotizadoPorAsesor.map((fila) => (
                  <li key={fila.idAsesor}>
                    <span>{fila.nombreAsesor}</span>
                    <strong>{pesos(fila.valorCotizado)}</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section className="kpi-card card">
              <h2 className="section-title">
                <Users size={18} /> Clientes por potencial
                <span className="chip-muestra">muestra</span>
              </h2>
              <ul className="kpi-barras">
                {kpis.clientesPorPotencial.map((fila) => (
                  <li key={fila.potencial}>
                    <span className="kpi-barra-meta">
                      <span>{fila.potencial}</span>
                      <strong>{fila.clientes}</strong>
                    </span>
                    <span className="kpi-barra">
                      <span
                        className="kpi-barra-relleno"
                        style={{ width: `${(fila.clientes / maxClientes) * 100}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="kpi-card card">
              <h2 className="section-title">
                <Package size={18} /> Pedidos por asesor
              </h2>
              {kpis.pedidosPorAsesor.length === 0 ? (
                <p className="kpi-vacio muted">
                  Aún no hay pedidos. La tabla PEDIDO está pendiente (dueño:
                  Daniel).
                </p>
              ) : (
                <ul className="kpi-lista">
                  {kpis.pedidosPorAsesor.map((fila) => (
                    <li key={fila.idAsesor}>
                      <span>{fila.nombreAsesor}</span>
                      <strong>{fila.pedidos}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <p className="kpi-nota muted">
            {kpis.idAsesorFiltrado === null
              ? "Vista de administrador: todos los indicadores. "
              : "Vista de asesor: solo sus indicadores. "}
            Cotizaciones, valor cotizado y clientes por potencial usan datos de
            muestra; se conectan a los módulos de ventas y clientes cuando
            exporten sus casos de uso.
          </p>
        </>
      )}
    </div>
  );
}
