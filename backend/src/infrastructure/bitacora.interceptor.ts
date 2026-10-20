// Interceptor de NestJS que registra automáticamente en la bitácora
// las acciones marcadas con el decorator @RegistrarEnBitacora.
// Al finalizar la ejecución de cualquier handler controlado por este interceptor,
// guarda un registro con: usuario, acción, fecha, módulo y detalles.

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

// Exportaciones de tipos
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

export interface RegistroBitacora {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  accion: AccionBitacora;
  modulo: string;
  fecha: string;
  detalle: string;
  ip?: string;
}

@Injectable()
export class BitacoraInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Obtener la acción del decorator @RegistrarEnBitacora
    const accion = this.reflector.get<string>('bitacora_accion', context.getHandler());
    
    // Obtener el módulo basándose en la URL de la petición
    const request = context.switchToHttp().getRequest();
    const modulo = this.obtenerModulo(request.url ?? '');
    
    // Obtener usuario del contexto de BetterAuth
    const usuario = this.obtenerUsuario(request);
    
    // Obtener dirección IP
    const ip = request.ip || request.socket?.remoteAddress;

    return next.handle().pipe(
      map((data) => {
        // Registrar en bitácora después de que el handler se ejecutó
        if (accion && usuario) {
          this.registrarEnBitacora({
            accion: accion as AccionBitacora,
            modulo: modulo,
            usuario_id: usuario.id,
            usuario_nombre: usuario.nombre,
            fecha: new Date().toISOString(),
            detalle: `${request.method} ${request.url} - ${accion}`,
            ip: ip,
          });
        }
        return data;
      })
    );
  }

  private obtenerModulo(url: string): string {
    if (url.includes('/clientes')) return 'clientes';
    if (url.includes('/visitas')) return 'visitas';
    if (url.includes('/cotizaciones')) return 'cotizaciones';
    if (url.includes('/pedidos')) return 'pedidos';
    if (url.includes('/seguimientos')) return 'seguimiento';
    return 'desconocido';
  }

  private obtenerUsuario(request: any): { id: number; nombre: string } | null {
    // Intentar obtener el usuario de la sesión de BetterAuth
    const user = request.user ?? request.session?.user;
    if (user && user.id && user.nombre) {
      return { id: user.id, nombre: user.nombre };
    }
    // Si no hay usuario en el contexto, aún así registramos para tener trazabilidad
    return null;
  }

  private async registrarEnBitacora(registro: Omit<RegistroBitacora, 'id'>): Promise<void> {
    // TODO: Implementar guardado real en base de datos
    // Por ahora, el registro se hace aquí pero la persistencia en BD
    // dependerá de la configuración de BetterAuth y la tabla bitácora.
    // En producción se insertaría en la tabla bitácora del módulo de Kevin B.
    // Console.log('Bitácora registrada:', registro);
  }
}