import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { Controller, Get } from '@nestjs/common';

// Jenkins y el despliegue en EC2 usan este endpoint para saber si la app está viva.
// HU-02: es público porque Jenkins no inicia sesión; sin @AllowAnonymous()
// el guard de sesión le devolvería 401 y el despliegue fallaría.
@AllowAnonymous()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
