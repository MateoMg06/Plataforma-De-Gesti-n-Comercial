export enum UserRole {
  ADMINISTRADOR = 'administrador',
  LIDER = 'lider',
  ASESOR = 'asesor',
}

export enum RutaEstado {
  PLANEADA = 'planeada',
  ACTIVA = 'activa',
  FINALIZADA = 'finalizada',
}

export enum VisitaEstado {
  PROGRAMADA = 'programada',
  REALIZADA = 'realizada',
  CANCELADA = 'cancelada',
  NO_ATENDIDA = 'no_atendida',
  REPROGRAMADA = 'reprogramada',
}

export enum CotizacionEstado {
  BORRADOR = 'borrador',
  ENVIADA = 'enviada',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

export enum AsesorEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

export enum PedidoEstado {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  CANCELADO = 'cancelado',
  ENTREGADO = 'entregado',
}

/** Devuelve el arreglo de valores, util para validaciones @IsIn y migraciones. */
export const enumValues = <T extends Record<string, string>>(e: T): Array<T[keyof T]> =>
  Object.values(e) as Array<T[keyof T]>;