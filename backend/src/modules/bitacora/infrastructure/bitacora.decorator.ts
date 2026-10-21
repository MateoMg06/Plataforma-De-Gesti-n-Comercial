// Decorador para marcar acciones que deben registrarse en la bitácora.
// Se usa sobre métodos de controladores o casos de uso.
// Ejemplo: @RegistrarEnBitacora('crear_cliente')
// El nombre de la acción es un string que identifica qué tipo de operación se realizó.

import { NestInterceptor } from '@nestjs/common';

// Marca metadatos en el objetivo para indicar que debe registrarse en la bitácora.
// Este decorator se usa junto con un interceptor que lee estos metadatos y
// guarda un registro en la tabla de bitácora al finalizar la ejecución del handler.

function RegistrarEnBitacora(accion: string) {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    // Almacenamos la acción en metadatos reflectivos para que el interceptor pueda leerla.
    Reflect.defineMetadata('bitacora_accion', accion, target);
  };
}

export { RegistrarEnBitacora };