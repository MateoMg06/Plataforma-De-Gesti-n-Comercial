import { Calendar, CalendarClock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api, apiTodosLosClientes } from "../api/client";
import "./AgendaPage.css";

interface Visita {
  id: number;
  idCliente: number;
  idAsesor: number;
  fechaProgramada: string;
  estado: string;
  motivoReprogramacion?: string | null;
}

type Vista = "semana" | "mes";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// --- Ayudas de fechas (sin librerías) ---

// Lunes de la semana de una fecha, a las 00:00.
function inicioSemana(fecha: Date): Date {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const dia = (d.getDay() + 6) % 7; // 0 = lunes ... 6 = domingo
  d.setDate(d.getDate() - dia);
  return d;
}

function sumarDias(fecha: Date, dias: number): Date {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Días que se pintan: 7 en la semana; en el mes, semanas completas de lunes a domingo.
function diasVisibles(vista: Vista, referencia: Date): Date[] {
  if (vista === "semana") {
    const lunes = inicioSemana(referencia);
    return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  }
  const primero = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
  const ultimo = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);
  const desde = inicioSemana(primero);
  const hasta = sumarDias(inicioSemana(ultimo), 6);
  const dias: Date[] = [];
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) dias.push(d);
  return dias;
}

// Valor para un input datetime-local en hora local: "2026-10-28T10:00".
function paraInput(fecha: Date): string {
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

// HU-13: solo se reprograman las visitas pendientes.
const esPendiente = (estado: string) => estado === "programada" || estado === "reprogramada";

function hora(fecha: Date): string {
  return fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

// HU-11: agenda de todas las visitas, por semana o por mes.
// HU-12: el asesor ve solo SU agenda ("Mi agenda"); el administrador y el líder,
// que no son asesores, ven la de todos. Lo decide el rol de la sesión.
export function AgendaPage() {
  // null mientras se consulta la sesión.
  const [rol, setRol] = useState<string | null>(null);
  const mia = rol === "asesor";
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [clientes, setClientes] = useState<Record<number, string>>({});
  const [asesores, setAsesores] = useState<Record<number, string>>({});
  const [vista, setVista] = useState<Vista>("semana");
  const [referencia, setReferencia] = useState(new Date());
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  // HU-13: visita elegida para reprogramar, con la nueva fecha y el motivo.
  const [seleccion, setSeleccion] = useState<Visita | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarVisitas = () => {
    if (mia) {
      api<{ asesor: { id: number; nombre: string }; visitas: Visita[] }>("/agenda/mia")
        .then((agenda) => setVisitas(agenda.visitas))
        .catch((e) => setError(e.message));
    } else {
      api<Visita[]>("/visitas")
        .then(setVisitas)
        .catch((e) => setError(e.message));
    }
  };

  useEffect(() => {
    api<{ user: { role: string } } | null>("/auth/get-session")
      .then((datos) => setRol(datos?.user.role ?? ""))
      .catch(() => setRol(""));
  }, []);

  useEffect(() => {
    if (rol === null) return;
    setError("");
    cargarVisitas();
    // Nombres para mostrar en cada evento: la visita solo trae los ids.
    apiTodosLosClientes<{ id: number; razonSocial: string }>()
      .then((lista) =>
        setClientes(
          Object.fromEntries(lista.map((c) => [c.id, c.razonSocial])),
        ),
      )
      .catch((e) => setError(e.message));
    api<{ id: number; nombre: string }[]>("/asesores")
      .then((lista) =>
        setAsesores(Object.fromEntries(lista.map((a) => [a.id, a.nombre]))),
      )
      .catch((e) => setError(e.message));
  }, [rol]);

  const dias = diasVisibles(vista, referencia);
  const hoy = new Date();

  const mover = (sentido: 1 | -1) => {
    const d = new Date(referencia);
    if (vista === "semana") d.setDate(d.getDate() + 7 * sentido);
    else d.setMonth(d.getMonth() + sentido, 1);
    setReferencia(d);
  };

  const titulo =
    vista === "semana"
      ? `Semana del ${dias[0].toLocaleDateString("es-CO", { day: "numeric", month: "long" })} al ${dias[6].toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}`
      : referencia.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  const visitasDelDia = (dia: Date) =>
    visitas
      .map((v) => ({ ...v, fecha: new Date(v.fechaProgramada) }))
      .filter((v) => mismoDia(v.fecha, dia))
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  // Panel "Agenda del día" del diseño: las visitas de hoy en orden de hora.
  const deHoy = visitasDelDia(hoy);

  const elegir = (v: Visita) => {
    setSeleccion(v);
    setNuevaFecha(paraInput(new Date(v.fechaProgramada)));
    setMotivo("");
    setError("");
    setMensaje("");
  };

  // HU-13: reprogramar desde la agenda (queda registrado en la bitácora).
  const reprogramar = async (e: FormEvent) => {
    e.preventDefault();
    if (!seleccion) return;
    setError("");
    setGuardando(true);
    try {
      await api(`/agenda/visitas/${seleccion.id}/reprogramar`, {
        method: "PATCH",
        body: JSON.stringify({ fechaProgramada: nuevaFecha, motivo }),
      });
      setMensaje("Visita reprogramada.");
      setSeleccion(null);
      cargarVisitas();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <Calendar size={26} /> {mia ? "Mi agenda" : "Agenda comercial"}
          </h1>
          <p>{mia ? "Tus visitas como asesor." : "Visitas de todos los asesores."}</p>
        </div>
        <div className="page-actions">
          <div className="agenda-vistas" role="group" aria-label="Vista">
            <button
              className={`btn ${vista === "semana" ? "btn-primary" : ""}`}
              onClick={() => setVista("semana")}
            >
              Semana
            </button>
            <button
              className={`btn ${vista === "mes" ? "btn-primary" : ""}`}
              onClick={() => setVista("mes")}
            >
              Mes
            </button>
          </div>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="success" role="status">{mensaje}</p>}

      <div className="agenda-layout">
        <section className="card">
          <div className="agenda-barra">
            <strong className="agenda-titulo">{titulo}</strong>
            <div className="agenda-nav">
              <button className="btn-icon" aria-label="Anterior" onClick={() => mover(-1)}>
                <ChevronLeft size={20} />
              </button>
              <button className="btn btn-sm" onClick={() => setReferencia(new Date())}>
                Hoy
              </button>
              <button className="btn-icon" aria-label="Siguiente" onClick={() => mover(1)}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <div className={`agenda-grid agenda-${vista}`}>
              {DIAS.map((d) => (
                <div key={d} className="agenda-cabecera">
                  {d}
                </div>
              ))}
              {dias.map((dia) => (
                <div
                  key={dia.toISOString()}
                  className={[
                    "agenda-dia",
                    mismoDia(dia, hoy) ? "agenda-hoy" : "",
                    vista === "mes" && dia.getMonth() !== referencia.getMonth()
                      ? "agenda-fuera"
                      : "",
                    visitasDelDia(dia).length === 0 ? "agenda-dia-vacio" : "",
                  ].join(" ")}
                >
                  <div className="agenda-numero">
                    {/* En celular los días van en lista: ahí sí se muestra "Lun", "Mar"... */}
                    <span className="agenda-dia-nombre">{DIAS[(dia.getDay() + 6) % 7]}</span>
                    {dia.getDate()}
                  </div>
                  {visitasDelDia(dia).map((v) => (
                    <div
                      key={v.id}
                      className={`agenda-evento evento-${v.estado} ${esPendiente(v.estado) ? "agenda-evento-boton" : ""}`}
                      title={v.motivoReprogramacion ? `Motivo: ${v.motivoReprogramacion}` : undefined}
                      role={esPendiente(v.estado) ? "button" : undefined}
                      tabIndex={esPendiente(v.estado) ? 0 : undefined}
                      onClick={() => esPendiente(v.estado) && elegir(v)}
                      onKeyDown={(e) => e.key === "Enter" && esPendiente(v.estado) && elegir(v)}
                    >
                      <strong>{hora(v.fecha)}</strong>
                      <span>{clientes[v.idCliente] ?? `Cliente ${v.idCliente}`}</span>
                      <span className="agenda-asesor">
                        {asesores[v.idAsesor] ?? `Asesor ${v.idAsesor}`}
                      </span>
                      <span className={`pill pill-${v.estado}`}>
                        {v.estado.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="stack">
        {seleccion ? (
          <form className="card" onSubmit={reprogramar}>
            <h2 className="section-title">
              <CalendarClock size={18} /> Reprogramar visita
              <button type="button" className="btn-icon" aria-label="Cerrar" onClick={() => setSeleccion(null)}>
                <X size={18} />
              </button>
            </h2>
            <p className="muted agenda-reprogramar-cliente">
              {clientes[seleccion.idCliente] ?? `Cliente ${seleccion.idCliente}`} ·{" "}
              {asesores[seleccion.idAsesor] ?? `Asesor ${seleccion.idAsesor}`}
            </p>
            <fieldset className="stack" disabled={guardando}>
              <label className="field">
                Nueva fecha y hora *
                <input className="input" type="datetime-local" required value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
              </label>
              <label className="field">
                Motivo *
                <textarea
                  className="input"
                  required
                  maxLength={255}
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: el cliente pidió cambiar la cita"
                />
              </label>
              <button className="btn btn-primary">{guardando ? "Guardando…" : "Reprogramar"}</button>
            </fieldset>
          </form>
        ) : (
          <p className="muted agenda-ayuda">Haz clic en una visita pendiente del calendario para reprogramarla.</p>
        )}
        <aside className="card agenda-hoy-panel">
          <h2 className="section-title">
            Agenda del día
            <span className="agenda-fecha-hoy">
              {hoy.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </h2>
          {deHoy.length === 0 ? (
            <p className="muted">No hay visitas programadas para hoy.</p>
          ) : (
            <ol className="agenda-lista">
              {deHoy.map((v, i) => (
                <li key={v.id}>
                  <span className={`num num-${v.estado}`}>{i + 1}</span>
                  <span className="agenda-lista-hora">{hora(v.fecha)}</span>
                  <span className="agenda-lista-datos">
                    <strong>{clientes[v.idCliente] ?? `Cliente ${v.idCliente}`}</strong>
                    <span className="muted">
                      {asesores[v.idAsesor] ?? `Asesor ${v.idAsesor}`}
                    </span>
                  </span>
                  <span className={`pill pill-${v.estado}`}>
                    {v.estado.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </aside>
        </div>
      </div>
    </div>
  );
}
