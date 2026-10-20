import { useEffect, useState, type FormEvent } from "react";
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

  return (
    <div className="card clientes-page">
      <h1 className="page-title">Clientes</h1>
      <p className="muted">Consulta, edita y administra tus clientes.</p>
      <form
        className="clientes-filtros"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setAplicados({ ...filtros });
        }}
      >
        <label htmlFor="buscar-clientes">
          Buscar por NIT, razón social o nombre comercial
          <input
            id="buscar-clientes"
            className="input"
            maxLength={200}
            value={filtros.busqueda}
            onChange={(e) =>
              setFiltros({ ...filtros, busqueda: e.target.value })
            }
          />
        </label>
        <label htmlFor="filtro-idZona">
          Zona
          <select
            id="filtro-idZona"
            className="input"
            value={filtros.idZona}
            onChange={(e) => setFiltros({ ...filtros, idZona: e.target.value })}
          >
            <option value="">Todos</option>
            {zonas.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.nombre}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="filtro-idTipoCliente">
          Tipo
          <select
            id="filtro-idTipoCliente"
            className="input"
            value={filtros.idTipoCliente}
            onChange={(e) =>
              setFiltros({ ...filtros, idTipoCliente: e.target.value })
            }
          >
            <option value="">Todos</option>
            {opciones.tipos.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.nombre}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="filtro-idPotencial">
          Potencial
          <select
            id="filtro-idPotencial"
            className="input"
            value={filtros.idPotencial}
            onChange={(e) =>
              setFiltros({ ...filtros, idPotencial: e.target.value })
            }
          >
            <option value="">Todos</option>
            {opciones.potenciales.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.nombre}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="filtro-idEstadoCliente">
          Estado
          <select
            id="filtro-idEstadoCliente"
            className="input"
            value={filtros.idEstadoCliente}
            onChange={(e) =>
              setFiltros({ ...filtros, idEstadoCliente: e.target.value })
            }
          >
            <option value="">Todos</option>
            {opciones.estados.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.nombre}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" disabled={guardando}>
          Buscar
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
          Limpiar filtros
        </button>
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
        <p role="status">Cargando clientes…</p>
      ) : (
        !errorLista && (
          <>
            <p>{pagina.total} clientes encontrados</p>
            <div className="clientes-tabla">
              <table>
                <thead>
                  <tr>
                    <th>NIT</th>
                    <th>Razón social</th>
                    <th>Nombre comercial</th>
                    <th>Zona</th>
                    <th>Actividad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.datos.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.nit}</td>
                      <td>{cliente.razonSocial}</td>
                      <td>{cliente.nombreComercial}</td>
                      <td>
                        {zonas.find((zona) => zona.id === cliente.idZona)
                          ?.nombre ?? cliente.idZona}
                      </td>
                      <td>{cliente.activo ? "Activo" : "Inactivo"}</td>
                      <td>
                        <div className="clientes-acciones">
                          <button
                            className="btn"
                            disabled={guardando}
                            onClick={() => editar(cliente)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn"
                            disabled={guardando}
                            onClick={() => void cambiarActividad(cliente)}
                          >
                            {cliente.activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pagina.datos.length === 0 && (
                    <tr>
                      <td colSpan={6}>No hay clientes con estos criterios.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="clientes-paginacion">
              <button
                className="btn"
                disabled={page <= 1 || guardando}
                onClick={() => setPage((valor) => valor - 1)}
              >
                Anterior
              </button>
              <span>
                Página {page} de {Math.max(1, Math.ceil(pagina.total / limit))}
              </span>
              <button
                className="btn"
                disabled={page * limit >= pagina.total || guardando}
                onClick={() => setPage((valor) => valor + 1)}
              >
                Siguiente
              </button>
              <label htmlFor="limite-clientes">
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
            </div>
          </>
        )
      )}
      <h2 id="formulario-cliente" className="page-title">
        {editando === null ? "Registrar cliente" : "Editar cliente"}
      </h2>
      <p className="muted">
        Completa los datos del cliente y su ubicación. Todos los campos son
        obligatorios.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {exito && (
        <p className="clientes-exito" role="status">
          {exito}
        </p>
      )}
      {cargando ? (
        <p role="status">Cargando opciones…</p>
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
          <fieldset disabled={guardando}>
            <legend>Datos del cliente</legend>
            <div className="clientes-grid">
              <label htmlFor="nit">
                NIT
                <input
                  id="nit"
                  className="input"
                  type="text"
                  required
                  maxLength={30}
                  value={datos.nit}
                  onChange={(e) => cambiar("nit", e.target.value)}
                />
              </label>
              <label htmlFor="razonSocial">
                Razón social
                <input
                  id="razonSocial"
                  className="input"
                  type="text"
                  required
                  maxLength={200}
                  value={datos.razonSocial}
                  onChange={(e) => cambiar("razonSocial", e.target.value)}
                />
              </label>
              <label htmlFor="nombreComercial">
                Nombre comercial
                <input
                  id="nombreComercial"
                  className="input"
                  type="text"
                  required
                  maxLength={200}
                  value={datos.nombreComercial}
                  onChange={(e) => cambiar("nombreComercial", e.target.value)}
                />
              </label>
              <label htmlFor="direccion">
                Dirección
                <input
                  id="direccion"
                  className="input"
                  type="text"
                  required
                  maxLength={250}
                  value={datos.direccion}
                  onChange={(e) => cambiar("direccion", e.target.value)}
                />
              </label>
              <label htmlFor="departamento">
                Departamento
                <input
                  id="departamento"
                  className="input"
                  type="text"
                  required
                  maxLength={100}
                  value={datos.departamento}
                  onChange={(e) => cambiar("departamento", e.target.value)}
                />
              </label>
              <label htmlFor="municipio">
                Municipio
                <input
                  id="municipio"
                  className="input"
                  type="text"
                  required
                  maxLength={100}
                  value={datos.municipio}
                  onChange={(e) => cambiar("municipio", e.target.value)}
                />
              </label>
              <label htmlFor="barrio">
                Barrio
                <input
                  id="barrio"
                  className="input"
                  type="text"
                  required
                  maxLength={100}
                  value={datos.barrio}
                  onChange={(e) => cambiar("barrio", e.target.value)}
                />
              </label>
              <label htmlFor="telefono">
                Teléfono
                <input
                  id="telefono"
                  className="input"
                  type="tel"
                  required
                  maxLength={30}
                  value={datos.telefono}
                  onChange={(e) => cambiar("telefono", e.target.value)}
                />
              </label>
              <label htmlFor="email">
                Correo electrónico
                <input
                  id="email"
                  className="input"
                  type="email"
                  required
                  maxLength={254}
                  value={datos.email}
                  onChange={(e) => cambiar("email", e.target.value)}
                />
              </label>
            </div>
          </fieldset>
          <fieldset disabled={guardando}>
            <legend>Clasificación y visitas</legend>
            <div className="clientes-grid">
              <label htmlFor="idZona">
                Zona
                <select
                  id="idZona"
                  className="input"
                  required
                  value={datos.idZona}
                  onChange={(e) => cambiar("idZona", e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  {zonas.map((opcion) => (
                    <option key={opcion.id} value={opcion.id}>
                      {opcion.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="idTipoCliente">
                Tipo de cliente
                <select
                  id="idTipoCliente"
                  className="input"
                  required
                  value={datos.idTipoCliente}
                  onChange={(e) => cambiar("idTipoCliente", e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  {opciones.tipos.map((opcion) => (
                    <option key={opcion.id} value={opcion.id}>
                      {opcion.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="idPotencial">
                Potencial
                <select
                  id="idPotencial"
                  className="input"
                  required
                  value={datos.idPotencial}
                  onChange={(e) => cambiar("idPotencial", e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  {opciones.potenciales.map((opcion) => (
                    <option key={opcion.id} value={opcion.id}>
                      {opcion.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="idEstadoCliente">
                Estado
                <select
                  id="idEstadoCliente"
                  className="input"
                  required
                  value={datos.idEstadoCliente}
                  onChange={(e) => cambiar("idEstadoCliente", e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  {opciones.estados.map((opcion) => (
                    <option key={opcion.id} value={opcion.id}>
                      {opcion.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="frecuenciaVisitaDias">
                Frecuencia de visita (días)
                <input
                  id="frecuenciaVisitaDias"
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={datos.frecuenciaVisitaDias}
                  onChange={(e) =>
                    cambiar("frecuenciaVisitaDias", e.target.value)
                  }
                />
              </label>
            </div>
          </fieldset>
          <fieldset disabled={guardando}>
            <legend>Ubicación</legend>
            <div className="clientes-grid">
              <label htmlFor="latitud">
                Latitud
                <input
                  id="latitud"
                  className="input"
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  required
                  value={datos.latitud}
                  onChange={(e) => cambiar("latitud", e.target.value)}
                />
              </label>
              <label htmlFor="longitud">
                Longitud
                <input
                  id="longitud"
                  className="input"
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  required
                  value={datos.longitud}
                  onChange={(e) => cambiar("longitud", e.target.value)}
                />
              </label>
            </div>
          </fieldset>
          <button className="btn btn-primary" disabled={guardando}>
            {guardando
              ? "Guardando…"
              : editando === null
                ? "Registrar cliente"
                : "Guardar cambios"}
          </button>
          {editando !== null && (
            <button
              type="button"
              className="btn"
              disabled={guardando}
              onClick={() => {
                setEditando(null);
                setDatos(formularioVacio);
                setError("");
              }}
            >
              Cancelar edición
            </button>
          )}
        </form>
      )}
    </div>
  );
}
