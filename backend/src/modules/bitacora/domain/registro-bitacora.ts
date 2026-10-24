// Entidad de dominio: TypeScript puro, sin NestJS ni TypeORM.
// Un registro de la bitácora: quién (usuario), cuándo (fecha) y qué (acción).
// Los registros los crea el interceptor; aquí solo se consultan (HU-25).
export class RegistroBitacora {
  constructor(
    public readonly id: number,
    public readonly usuarioId: string,
    public readonly usuarioNombre: string,
    public readonly accion: string,
    public readonly modulo: string,
    public readonly fecha: Date,
    public readonly detalle: string,
  ) {}
}

// Filtros de la consulta. Todos son opcionales y se combinan.
export interface FiltrosBitacora {
  usuarioId?: string;
  accion?: string;
  desde?: Date;
  hasta?: Date;
}

// Regla del negocio: el rango de fechas debe tener sentido.
export function validarFiltrosBitacora(filtros: FiltrosBitacora): void {
  if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
    throw new Error('La fecha "desde" no puede ser posterior a "hasta"');
  }
}
