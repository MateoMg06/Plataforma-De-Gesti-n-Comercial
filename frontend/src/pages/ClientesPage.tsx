import {
  Building2,
  Check,
  MapPin,
  Pencil,
  Power,
  Search,
  Tags,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import "./ClientesPage.css";

type Opcion = { id: number; nombre: string };
type Opciones = { tipos: Opcion[]; potenciales: Opcion[]; estados: Opcion[] };

const formularioVacio = {
  nit: "",
  razonSocial: "",
  nombreComercial: "",
  direccion: "",
  departamento: "",
  municipio: "",
  barrio: "",
  telefono: "",
  email: "",
  idZona: "",
  idTipoCliente: "",
  idPotencial: "",
  idEstadoCliente: "",
  frecuenciaVisitaDias: "",
  latitud: "",
  longitud: "",
};

type Cliente = {
  id: number;
  fechaCreacion: string;
  activo: boolean;
  nit: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  departamento: string;
  municipio: string;
  barrio: string;
  telefono: string;
  email: string;
  idZona: number;
  idTipoCliente: number;
  idPotencial: number;
  idEstadoCliente: number;
  frecuenciaVisitaDias: number;
  latitud: number;
  longitud: number;
};
type PaginaClientes = {
  datos: Cliente[];
  total: number;
  page: number;
  limit: number;
};
const filtrosVacios = {
  busqueda: "",
  idZona: "",
  idTipoCliente: "",
  idPotencial: "",
  idEstadoCliente: "",
};

export function ClientesPage() {
  const [datos, setDatos] = useState(formularioVacio);
  const [zonas, setZonas] = useState<Opcion[]>([]);
  const [opciones, setOpciones] = useState<Opciones>({
    tipos: [],
    potenciales: [],
    estados: [],
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [filtros, setFiltros] = useState(filtrosVacios);
  const [aplicados, setAplicados] = useState(filtrosVacios);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagina, setPagina] = useState<PaginaClientes>({
    datos: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState("");
  const [recarga, setRecarga] = useState(0);
  // El buscador de la barra superior llega como ?busqueda=texto.
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const texto = searchParams.get("busqueda");
    if (!texto) return;
    setFiltros((actuales) => ({ ...actuales, busqueda: texto }));
    setAplicados((actuales) => ({ ...actuales, busqueda: texto }));
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    let vigente = true;
    setCargandoLista(true);
    setErrorLista("");
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    for (const [campo, valor] of Object.entries(aplicados)) {
      if (valor.trim()) params.set(campo, valor.trim());
    }
    api<PaginaClientes>(`/clientes?${params}`)
      .then((respuesta) => {
        if (vigente) setPagina(respuesta);
      })
      .catch((err) => {
        if (vigente) setErrorLista((err as Error).message);
      })
      .finally(() => {
        if (vigente) setCargandoLista(false);
      });
    return () => {
      vigente = false;
    };
  }, [page, limit, aplicados, recarga]);

  const editar = (cliente: Cliente) => {
    setEditando(cliente.id);
    setDatos({
      nit: cliente.nit,
      razonSocial: cliente.razonSocial,
      nombreComercial: cliente.nombreComercial,
      direccion: cliente.direccion,
      departamento: cliente.departamento,
      municipio: cliente.municipio,
      barrio: cliente.barrio,
      telefono: cliente.telefono,
      email: cliente.email,
      idZona: String(cliente.idZona),
      idTipoCliente: String(cliente.idTipoCliente),
      idPotencial: String(cliente.idPotencial),
      idEstadoCliente: String(cliente.idEstadoCliente),
      frecuenciaVisitaDias: String(cliente.frecuenciaVisitaDias),
      latitud: String(cliente.latitud),
      longitud: String(cliente.longitud),
    });
    setError("");
    setExito("");
    document
      .getElementById("formulario-cliente")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const cambiarActividad = async (cliente: Cliente) => {
    if (guardando) return;
    if (
      cliente.activo &&
      !window.confirm(`¿Desactivar a ${cliente.razonSocial}?`)
    )
      return;
    setGuardando(true);
    setError("");
    setExito("");
    try {
      await api(`/clientes/${cliente.id}/actividad`, {
        method: "PATCH",
        body: JSON.stringify({ activo: !cliente.activo }),
      });
      setExito(`Cliente ${cliente.activo ? "desactivado" : "activado"}.`);
      setRecarga((valor) => valor + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [zonasRecibidas, opcionesRecibidas] = await Promise.all([
        api<Opcion[]>("/zonas"),
        api<Opciones>("/clientes/opciones"),
      ]);
      setZonas(zonasRecibidas);
      setOpciones(opcionesRecibidas);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const cambiar = (campo: keyof typeof datos, valor: string) => {
    setDatos((anteriores) => ({ ...anteriores, [campo]: valor }));
    setExito("");
  };

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setError("");
    setExito("");
    try {
      const cliente = await api<Cliente>(
        editando === null ? "/clientes" : `/clientes/${editando}`,
        {
          method: editando === null ? "POST" : "PUT",
          body: JSON.stringify({
            ...datos,
            email: datos.email.trim().toLowerCase(),
            idZona: Number(datos.idZona),
            idTipoCliente: Number(datos.idTipoCliente),
            idPotencial: Number(datos.idPotencial),
            idEstadoCliente: Number(datos.idEstadoCliente),
            frecuenciaVisitaDias: Number(datos.frecuenciaVisitaDias),
            latitud: Number(datos.latitud),
            longitud: Number(datos.longitud),
          }),
        },
      );
      setDatos(formularioVacio);
      setExito(
        editando === null
          ? `Cliente ${cliente.razonSocial} registrado con el número ${cliente.id}.`
          : `Cliente ${cliente.razonSocial} actualizado.`,
      );
      if (editando === null) setPage(1);
      setEditando(null);
      setRecarga((valor) => valor + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const hayOpciones =
    zonas.length > 0 &&
    opciones.tipos.length > 0 &&
    opciones.potenciales.length > 0 &&
    opciones.estados.length > 0;

  // Campo de texto del formulario: etiqueta arriba y control abajo.
  const campo = (
    id: keyof typeof datos,
    etiqueta: string,
    extra: { type?: string; maxLength?: number; min?: string; max?: string; step?: string } = {},
  ) => (
    <label htmlFor={id} className="field">
      {etiqueta} *
      <input
        id={id}
        className="input"
        type={extra.type ?? "text"}
        required
        maxLength={extra.maxLength}
        min={extra.min}
        max={extra.max}
        step={extra.step}
        value={datos[id]}
        onChange={(e) => cambiar(id, e.target.value)}
      />
    </label>
  );

  // Lista desplegable del formulario (zona, tipo, potencial, estado).
  const lista = (id: keyof typeof datos, etiqueta: string, items: Opcion[]) => (
    <label htmlFor={id} className="field">
      {etiqueta} *
      <select
        id={id}
        className="input"
        required
        value={datos[id]}
        onChange={(e) => cambiar(id, e.target.value)}
      >
        <option value="">Selecciona una opción</option>
        {items.map((opcion) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.nombre}
          </option>
        ))}
      </select>
    </label>
  );

  // Filtro de la tabla (zona, tipo, potencial, estado).
  const filtro = (
    id: keyof typeof filtros,
    etiqueta: string,
    items: Opcion[],
  ) => (
    <label htmlFor={`filtro-${id}`} className="field">
      {etiqueta}
      <select
        id={`filtro-${id}`}
        className="input"
        value={filtros[id]}
        onChange={(e) => setFiltros({ ...filtros, [id]: e.target.value })}
      >
        <option value="">Todos</option>
        {items.map((opcion) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.nombre}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="clientes-page">
      <div className="page-header">
        <div>
          <h1>
            <Users size={26} /> Clientes
          </h1>
          <p>Consulta, edita y administra tus clientes.</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() =>
              document
                .getElementById("formulario-cliente")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <UserPlus size={18} /> Nuevo cliente
          </button>
        </div>
      </div>

      <div className="stack">
        <section className="card">
          <form
            className="toolbar clientes-filtros"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setAplicados({ ...filtros });
            }}
          >
            <label htmlFor="buscar-clientes" className="field clientes-busqueda">
              Buscar
              <input
                id="buscar-clientes"
                className="input"
                placeholder="NIT, razón social o nombre comercial"
                maxLength={200}
                value={filtros.busqueda}
                onChange={(e) =>
                  setFiltros({ ...filtros, busqueda: e.target.value })
                }
              />
            </label>
            {filtro("idZona", "Zona", zonas)}
            {filtro("idTipoCliente", "Tipo", opciones.tipos)}
            {filtro("idPotencial", "Potencial", opciones.potenciales)}
            {filtro("idEstadoCliente", "Estado", opciones.estados)}
            <div className="form-actions">
              <button className="btn btn-primary" disabled={guardando}>
                <Search size={18} /> Buscar
              </button>
              <button
                type="button"
                className="btn"
                disabled={guardando}
                onClick={() => {
                  setFiltros(filtrosVacios);
                  setAplicados({ ...filtrosVacios });
                  setPage(1);
                }}
              >
                Limpiar
              </button>
            </div>
          </form>

          {errorLista && (
            <div role="alert">
              <p className="error">{errorLista}</p>
              <button
                className="btn"
                onClick={() => setRecarga((valor) => valor + 1)}
              >
                Reintentar listado
              </button>
            </div>
          )}
          {cargandoLista ? (
            <p role="status" className="muted">
              Cargando clientes…
            </p>
          ) : (
            !errorLista && (
              <>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>NIT</th>
                        <th>Razón social</th>
                        <th>Nombre comercial</th>
                        <th>Municipio</th>
                        <th>Zona</th>
                        <th>Estado</th>
                        <th className="derecha">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagina.datos.map((cliente) => (
                        <tr key={cliente.id}>
                          <td>{cliente.nit}</td>
                          <td>
                            <strong>{cliente.razonSocial}</strong>
                          </td>
                          <td>{cliente.nombreComercial}</td>
                          <td>{cliente.municipio}</td>
                          <td>
                            {zonas.find((zona) => zona.id === cliente.idZona)
                              ?.nombre ?? cliente.idZona}
                          </td>
                          <td>
                            <span
                              className={`pill ${cliente.activo ? "pill-activo" : ""}`}
                            >
                              {cliente.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td>
                            <div className="acciones">
                              <button
                                className="btn-icon"
                                aria-label={`Editar ${cliente.razonSocial}`}
                                title="Editar"
                                disabled={guardando}
                                onClick={() => editar(cliente)}
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                className={`btn-icon ${cliente.activo ? "danger" : ""}`}
                                aria-label={`${cliente.activo ? "Desactivar" : "Activar"} ${cliente.razonSocial}`}
                                title={cliente.activo ? "Desactivar" : "Activar"}
                                disabled={guardando}
                                onClick={() => void cambiarActividad(cliente)}
                              >
                                <Power size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pagina.datos.length === 0 && (
                        <tr>
                          <td colSpan={7} className="vacio">
                            No hay clientes con estos criterios.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer">
                  <span>
                    {pagina.total} clientes · Página {page} de{" "}
                    {Math.max(1, Math.ceil(pagina.total / limit))}
                  </span>
                  <div className="form-actions">
                    <label htmlFor="limite-clientes" className="clientes-limite">
                      Por página
                      <select
                        id="limite-clientes"
                        className="input"
                        value={limit}
                        disabled={guardando}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </label>
                    <button
                      className="btn btn-sm"
                      disabled={page <= 1 || guardando}
                      onClick={() => setPage((valor) => valor - 1)}
                    >
                      Anterior
                    </button>
                    <button
                      className="btn btn-sm"
                      disabled={page * limit >= pagina.total || guardando}
                      onClick={() => setPage((valor) => valor + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )
          )}
        </section>

        <section className="card" id="formulario-cliente">
          <div className="page-header clientes-form-cabecera">
            <div>
              <h2 className="section-title">
                {editando === null ? <UserPlus size={20} /> : <Pencil size={20} />}
                {editando === null ? "Registrar cliente" : "Editar cliente"}
              </h2>
              <p>
                Completa los datos del cliente y su ubicación. Todos los campos
                son obligatorios.
              </p>
            </div>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {cargando ? (
            <p role="status" className="muted">
              Cargando opciones…
            </p>
          ) : !hayOpciones ? (
            <div>
              <p>
                Faltan opciones de zona, tipo, potencial o estado para registrar
                clientes.
              </p>
              <button className="btn" onClick={() => void cargar()}>
                Volver a cargar
              </button>
            </div>
          ) : (
            <form onSubmit={guardar}>
              <fieldset className="stack" disabled={guardando}>
                <div>
                  <h3 className="section-title clientes-seccion">
                    <Building2 size={18} /> 1. Datos del cliente
                  </h3>
                  <div className="form-grid">
                    {campo("nit", "NIT", { maxLength: 30 })}
                    <div className="span-2">
                      {campo("razonSocial", "Razón social", { maxLength: 200 })}
                    </div>
                    {campo("nombreComercial", "Nombre comercial", { maxLength: 200 })}
                    {campo("telefono", "Teléfono", { type: "tel", maxLength: 30 })}
                    <div className="span-2">
                      {campo("email", "Correo electrónico", { type: "email", maxLength: 254 })}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="section-title clientes-seccion">
                    <MapPin size={18} /> 2. Ubicación
                  </h3>
                  <div className="form-grid">
                    <div className="span-2">
                      {campo("direccion", "Dirección", { maxLength: 250 })}
                    </div>
                    {campo("departamento", "Departamento", { maxLength: 100 })}
                    {campo("municipio", "Municipio", { maxLength: 100 })}
                    {campo("barrio", "Barrio", { maxLength: 100 })}
                    {campo("latitud", "Latitud", { type: "number", min: "-90", max: "90", step: "any" })}
                    {campo("longitud", "Longitud", { type: "number", min: "-180", max: "180", step: "any" })}
                  </div>
                </div>
                <div>
                  <h3 className="section-title clientes-seccion">
                    <Tags size={18} /> 3. Clasificación y visitas
                  </h3>
                  <div className="form-grid">
                    {lista("idZona", "Zona", zonas)}
                    {lista("idTipoCliente", "Tipo de cliente", opciones.tipos)}
                    {lista("idPotencial", "Potencial", opciones.potenciales)}
                    {lista("idEstadoCliente", "Estado", opciones.estados)}
                    {campo("frecuenciaVisitaDias", "Frecuencia de visita (días)", { type: "number", min: "1", step: "1" })}
                  </div>
                </div>
                <div className="form-actions clientes-botones">
                  {editando !== null && (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setEditando(null);
                        setDatos(formularioVacio);
                        setError("");
                      }}
                    >
                      Cancelar edición
                    </button>
                  )}
                  <button className="btn btn-primary">
                    <Check size={18} />
                    {guardando
                      ? "Guardando…"
                      : editando === null
                        ? "Registrar cliente"
                        : "Guardar cambios"}
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </section>
      </div>

      {/* Aviso flotante: se ve aunque la lista o el formulario estén fuera de pantalla. */}
      {exito && (
        <div className="success clientes-aviso" role="status">
          <Check size={16} /> {exito}
          <button
            className="btn-icon"
            aria-label="Cerrar aviso"
            onClick={() => setExito("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
