export type DatosCliente = {
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

export class Cliente {
  readonly nit: string;
  readonly razonSocial: string;
  readonly nombreComercial: string;
  readonly direccion: string;
  readonly departamento: string;
  readonly municipio: string;
  readonly barrio: string;
  readonly telefono: string;
  readonly email: string;
  readonly idZona: number;
  readonly idTipoCliente: number;
  readonly idPotencial: number;
  readonly idEstadoCliente: number;
  readonly frecuenciaVisitaDias: number;
  readonly latitud: number;
  readonly longitud: number;

  constructor(
    public readonly id: number | null,
    datos: DatosCliente,
    public readonly fechaCreacion: Date,
    public readonly activo: boolean,
  ) {
    this.nit = datos.nit;
    this.razonSocial = datos.razonSocial;
    this.nombreComercial = datos.nombreComercial;
    this.direccion = datos.direccion;
    this.departamento = datos.departamento;
    this.municipio = datos.municipio;
    this.barrio = datos.barrio;
    this.telefono = datos.telefono;
    this.email = datos.email;
    this.idZona = datos.idZona;
    this.idTipoCliente = datos.idTipoCliente;
    this.idPotencial = datos.idPotencial;
    this.idEstadoCliente = datos.idEstadoCliente;
    this.frecuenciaVisitaDias = datos.frecuenciaVisitaDias;
    this.latitud = datos.latitud;
    this.longitud = datos.longitud;
  }

  editar(datos: DatosCliente): Cliente {
    const validados = Cliente.crear(datos);
    return new Cliente(this.id, validados, this.fechaCreacion, this.activo);
  }

  cambiarActividad(activo: boolean): Cliente {
    return new Cliente(this.id, this, this.fechaCreacion, activo);
  }

  static crear(datos: DatosCliente): Cliente {
    const normalizados = { ...datos };
    normalizados.nit = datos.nit.trim();
    normalizados.razonSocial = datos.razonSocial.trim();
    normalizados.nombreComercial = datos.nombreComercial.trim();
    normalizados.direccion = datos.direccion.trim();
    normalizados.departamento = datos.departamento.trim();
    normalizados.municipio = datos.municipio.trim();
    normalizados.barrio = datos.barrio.trim();
    normalizados.telefono = datos.telefono.trim();
    normalizados.email = datos.email.trim();
    normalizados.email = normalizados.email.toLowerCase();
    for (const [campo, valor] of Object.entries(normalizados)) {
      if (typeof valor === 'string' && valor.length === 0) {
        throw new Error(`El campo ${campo} es obligatorio`);
      }
    }
    for (const id of [
      datos.idZona,
      datos.idTipoCliente,
      datos.idPotencial,
      datos.idEstadoCliente,
    ]) {
      if (!Number.isInteger(id) || id < 1)
        throw new Error('Los catálogos deben tener un ID válido');
    }
    if (
      !Number.isInteger(datos.frecuenciaVisitaDias) ||
      datos.frecuenciaVisitaDias < 1
    ) {
      throw new Error(
        'La frecuencia de visita debe ser un número entero positivo',
      );
    }
    if (
      !Number.isFinite(datos.latitud) ||
      datos.latitud < -90 ||
      datos.latitud > 90
    ) {
      throw new Error('La latitud debe estar entre -90 y 90');
    }
    if (
      !Number.isFinite(datos.longitud) ||
      datos.longitud < -180 ||
      datos.longitud > 180
    ) {
      throw new Error('La longitud debe estar entre -180 y 180');
    }
    return new Cliente(null, normalizados, new Date(), true);
  }
}
