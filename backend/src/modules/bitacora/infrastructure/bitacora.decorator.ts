// Decorador para marcar acciones que deben registrarse en la bitácora.
// Se usa sobre métodos de controladores.
// Ejemplo: @RegistrarEnBitacora('crear_cliente')
// El nombre de la acción es un string que identifica qué tipo de operación se realizó.

import { SetMetadata } from '@nestjs/common';

// Guarda la acción en los metadatos del MÉTODO (no de la clase), que es donde
// el BitacoraInterceptor la busca con context.getHandler().
function RegistrarEnBitacora(accion: string) {
  return SetMetadata('bitacora_accion', accion);
}

export { RegistrarEnBitacora };
