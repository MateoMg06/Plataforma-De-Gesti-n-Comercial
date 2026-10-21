// Interceptor de NestJS que registra automáticamente en la bitácora
// las acciones marcadas con el decorator @RegistrarEnBitacora.
// Al finalizar la ejecución de cualquier handler controlado por este interceptor,
// guarda un registro con: usuario, acción, fecha, módulo y detalles.

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { BitacoraOrmEntity } from './bitacora.orm-entity.js';

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
  | 'reprogramar_visita'
  | 'crear_seguimiento';

export interface RegistroBitacora {
  id: number;
  usuario_id: string;
  usuario_nombre: string;
  accion: AccionBitacora;
  modulo: string;
  fecha: string;
  detalle: string;
  ip?: string;
}

@Injectable()
export class BitacoraInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource
  ) {}

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
          // Si falla el registro no se rompe la respuesta al usuario.
          this.registrarEnBitacora({
            accion: accion as AccionBitacora,
            modulo: modulo,
            usuario_id: usuario.id,
            usuario_nombre: usuario.nombre,
            fecha: new Date().toISOString(),
            detalle: `${request.method} ${request.url} - ${accion}`,
            ip: ip,
          }).catch((error) => console.error('No se pudo registrar en la bitácora', error));
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

  private obtenerUsuario(request: any): { id: string; nombre: string } | null {
    // El guard de BetterAuth deja el usuario en request.user.
    // BetterAuth usa user.name (no nombre) y su id es texto.
    const user = request.user ?? request.session?.user;
    if (user && user.id && user.name) {
      return { id: user.id, nombre: user.name };
    }
    // Si no hay usuario en el contexto, aún así registramos para tener trazabilidad
    return null;
  }

  private async registrarEnBitacora(registro: Omit<RegistroBitacora, 'id'>): Promise<void> {
    const repo = this.dataSource.getRepository(BitacoraOrmEntity);
    await repo.save({
      usuario_id: registro.usuario_id,
      usuario_nombre: registro.usuario_nombre,
      accion: registro.accion,
      modulo: registro.modulo,
      fecha: new Date(),
      detalle: registro.detalle,
      ip: registro.ip,
    });
  }
}

// Type auxiliar para omitir el campo id del interfaz al guardar
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;