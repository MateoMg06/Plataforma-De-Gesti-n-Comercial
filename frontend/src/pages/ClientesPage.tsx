import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import './ClientesPage.css';

type Opcion = { id: number; nombre: string };
type Opciones = { tipos: Opcion[]; potenciales: Opcion[]; estados: Opcion[] };

const formularioVacio = {
  nit: '',
  razonSocial: '',
  nombreComercial: '',
  direccion: '',
  departamento: '',
  municipio: '',
  barrio: '',
  telefono: '',
  email: '',
  idZona: '', idTipoCliente: '', idPotencial: '', idEstadoCliente: '',
  frecuenciaVisitaDias: '', latitud: '', longitud: '',
};

export function ClientesPage() {
  const [datos, setDatos] = useState(formularioVacio);
  const [zonas, setZonas] = useState<Opcion[]>([]);
  const [opciones, setOpciones] = useState<Opciones>({ tipos: [], potenciales: [], estados: [] });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const [zonasRecibidas, opcionesRecibidas] = await Promise.all([
        api<Opcion[]>('/zonas'), api<Opciones>('/clientes/opciones'),
      ]);
      setZonas(zonasRecibidas);
      setOpciones(opcionesRecibidas);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargar(); }, []);

  const cambiar = (campo: keyof typeof datos, valor: string) => {
    setDatos((anteriores) => ({ ...anteriores, [campo]: valor }));
    setExito('');
  };

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setError('');
    setExito('');
    try {
      const cliente = await api<{ id: number; razonSocial: string }>('/clientes', {
        method: 'POST',
        body: JSON.stringify({
          ...datos,
          email: datos.email.trim().toLowerCase(),
          idZona: Number(datos.idZona), idTipoCliente: Number(datos.idTipoCliente),
          idPotencial: Number(datos.idPotencial), idEstadoCliente: Number(datos.idEstadoCliente),
          frecuenciaVisitaDias: Number(datos.frecuenciaVisitaDias),
          latitud: Number(datos.latitud), longitud: Number(datos.longitud),
        }),
      });
      setDatos(formularioVacio);
      setExito(`Cliente ${cliente.razonSocial} registrado con el número ${cliente.id}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const hayOpciones = zonas.length > 0 && opciones.tipos.length > 0
    && opciones.potenciales.length > 0 && opciones.estados.length > 0;

  return (
    <div className="card clientes-page">
      <h1 className="page-title">Registrar cliente</h1>
      <p className="muted">Completa los datos del cliente y su ubicación. Todos los campos son obligatorios.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {exito && <p className="clientes-exito" role="status">{exito}</p>}
      {cargando ? <p role="status">Cargando opciones…</p> : !hayOpciones ? (
        <div>
          <p>Faltan opciones de zona, tipo, potencial o estado para registrar clientes.</p>
          <button className="btn" onClick={() => void cargar()}>Volver a cargar</button>
        </div>
      ) : (
        <form onSubmit={guardar}>
          <fieldset disabled={guardando}>
            <legend>Datos del cliente</legend>
            <div className="clientes-grid">
              <label htmlFor="nit">NIT
                <input id="nit" className="input" type="text" required maxLength={30}
                  value={datos.nit} onChange={(e) => cambiar('nit', e.target.value)} />
              </label>
              <label htmlFor="razonSocial">Razón social
                <input id="razonSocial" className="input" type="text" required maxLength={200}
                  value={datos.razonSocial} onChange={(e) => cambiar('razonSocial', e.target.value)} />
              </label>
              <label htmlFor="nombreComercial">Nombre comercial
                <input id="nombreComercial" className="input" type="text" required maxLength={200}
                  value={datos.nombreComercial} onChange={(e) => cambiar('nombreComercial', e.target.value)} />
              </label>
              <label htmlFor="direccion">Dirección
                <input id="direccion" className="input" type="text" required maxLength={250}
                  value={datos.direccion} onChange={(e) => cambiar('direccion', e.target.value)} />
              </label>
              <label htmlFor="departamento">Departamento
                <input id="departamento" className="input" type="text" required maxLength={100}
                  value={datos.departamento} onChange={(e) => cambiar('departamento', e.target.value)} />
              </label>
              <label htmlFor="municipio">Municipio
                <input id="municipio" className="input" type="text" required maxLength={100}
                  value={datos.municipio} onChange={(e) => cambiar('municipio', e.target.value)} />
              </label>
              <label htmlFor="barrio">Barrio
                <input id="barrio" className="input" type="text" required maxLength={100}
                  value={datos.barrio} onChange={(e) => cambiar('barrio', e.target.value)} />
              </label>
              <label htmlFor="telefono">Teléfono
                <input id="telefono" className="input" type="tel" required maxLength={30}
                  value={datos.telefono} onChange={(e) => cambiar('telefono', e.target.value)} />
              </label>
              <label htmlFor="email">Correo electrónico
                <input id="email" className="input" type="email" required maxLength={254}
                  value={datos.email} onChange={(e) => cambiar('email', e.target.value)} />
              </label>
            </div>
          </fieldset>
          <fieldset disabled={guardando}>
            <legend>Clasificación y visitas</legend>
            <div className="clientes-grid">
              <label htmlFor="idZona">Zona
                <select id="idZona" className="input" required value={datos.idZona}
                  onChange={(e) => cambiar('idZona', e.target.value)}>
                  <option value="">Selecciona una opción</option>
                  {zonas.map((opcion) => <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>)}
                </select>
              </label>
              <label htmlFor="idTipoCliente">Tipo de cliente
                <select id="idTipoCliente" className="input" required value={datos.idTipoCliente}
                  onChange={(e) => cambiar('idTipoCliente', e.target.value)}>
                  <option value="">Selecciona una opción</option>
                  {opciones.tipos.map((opcion) => <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>)}
                </select>
              </label>
              <label htmlFor="idPotencial">Potencial
                <select id="idPotencial" className="input" required value={datos.idPotencial}
                  onChange={(e) => cambiar('idPotencial', e.target.value)}>
                  <option value="">Selecciona una opción</option>
                  {opciones.potenciales.map((opcion) => <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>)}
                </select>
              </label>
              <label htmlFor="idEstadoCliente">Estado
                <select id="idEstadoCliente" className="input" required value={datos.idEstadoCliente}
                  onChange={(e) => cambiar('idEstadoCliente', e.target.value)}>
                  <option value="">Selecciona una opción</option>
                  {opciones.estados.map((opcion) => <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>)}
                </select>
              </label>
              <label htmlFor="frecuenciaVisitaDias">Frecuencia de visita (días)
                <input id="frecuenciaVisitaDias" className="input" type="number" min="1" step="1" required
                  value={datos.frecuenciaVisitaDias} onChange={(e) => cambiar('frecuenciaVisitaDias', e.target.value)} />
              </label>
            </div>
          </fieldset>
          <fieldset disabled={guardando}>
            <legend>Ubicación</legend>
            <div className="clientes-grid">
              <label htmlFor="latitud">Latitud
                <input id="latitud" className="input" type="number" min="-90" max="90" step="any" required
                  value={datos.latitud} onChange={(e) => cambiar('latitud', e.target.value)} />
              </label>
              <label htmlFor="longitud">Longitud
                <input id="longitud" className="input" type="number" min="-180" max="180" step="any" required
                  value={datos.longitud} onChange={(e) => cambiar('longitud', e.target.value)} />
              </label>
            </div>
          </fieldset>
          <button className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Registrar cliente'}
          </button>
        </form>
      )}
    </div>
  );
}
