import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import {
  BITACORA_ACCION_KEY,
  type AccionBitacora,
} from './bitacora.decorator.js';
import { BitacoraOrmEntity } from './bitacora.orm-entity.js';

// Interceptor transversal de la bitácora.
// Lee el metadato que deja @RegistrarEnBitacora y, si el handler lo tiene,
// guarda un registro con quién, cuándo y qué se hizo.
@Injectable()
export class BitacoraInterceptor implements NestInterceptor {
  private readonly logger = new Logger(BitacoraInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(BitacoraOrmEntity)
    private readonly bitacora: Repository<BitacoraOrmEntity>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const accion = this.reflector.get<AccionBitacora>(
      BITACORA_ACCION_KEY,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      mergeMap(async (resultado: unknown) => {
        if (accion) {
          await this.registrar(accion, request);
        }
        return resultado;
      }),
    );
  }

  // Guarda el registro. Si falla, la bitácora no debe tumbar la petición.
  private async registrar(accion: AccionBitacora, request: any): Promise<void> {
    const usuario = this.obtenerUsuario(request);
    if (!usuario) return;

    try {
      await this.bitacora.save({
        usuario_id: usuario.id,
        usuario_nombre: usuario.nombre,
        accion,
        modulo: this.obtenerModulo(request.url ?? ''),
        fecha: new Date(),
        detalle: `${request.method} ${request.url} - ${accion}`,
        ip: request.ip ?? null,
      });
    } catch (error) {
      this.logger.warn(
        `No se pudo registrar la bitácora: ${(error as Error).message}`,
      );
    }
  }

  private obtenerModulo(url: string): string {
    if (url.includes('/clientes')) return 'clientes';
    if (url.includes('/visitas')) return 'visitas';
    if (url.includes('/cotizaciones')) return 'cotizaciones';
    if (url.includes('/pedidos')) return 'pedidos';
    if (url.includes('/seguimientos')) return 'seguimiento';
    return 'desconocido';
  }

  // El guard de BetterAuth deja el usuario de la sesión en request.user.
  private obtenerUsuario(request: any): { id: string; nombre: string } | null {
    const user = request.user ?? request.session?.user;
    if (!user?.id) return null;
    return { id: String(user.id), nombre: user.name ?? user.email ?? String(user.id) };
  }
}
