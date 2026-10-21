import { SetMetadata } from '@nestjs/common';

// Acciones que se pueden registrar en la bitácora.
// Los valores son los mismos que guarda la columna "accion" de la tabla bitacora.
export type AccionBitacora =
  | 'crear_cliente'
  | 'editar_cliente'
  | 'crear_visita'
  | 'editar_visita'
  | 'crear_cotizacion'
  | 'editar_cotizacion'
  | 'crear_pedido'
  | 'editar_pedido'
  | 'reprogramar_visita';

// Clave con la que el interceptor lee la acción a registrar.
export const BITACORA_ACCION_KEY = 'bitacora_accion';

// Marca el método para que el interceptor registre la acción en la bitácora.
// Ejemplo: @RegistrarEnBitacora('crear_cotizacion')
// SetMetadata guarda la acción sobre el método; eso es justo lo que el
// interceptor consulta con Reflector sobre el handler de la petición.
function RegistrarEnBitacora(accion: AccionBitacora) {
  return SetMetadata(BITACORA_ACCION_KEY, accion);
}

export { RegistrarEnBitacora };
