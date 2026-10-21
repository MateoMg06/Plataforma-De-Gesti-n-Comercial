import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

// Jenkins y el despliegue en EC2 usan este endpoint para saber si la app está viva.
// HU-02: es público porque Jenkins no inicia sesión; sin @AllowAnonymous()
// el guard de sesión le devolvería 401 y el despliegue fallaría.
@ApiTags('Salud')
@AllowAnonymous()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Estado de la API', description: 'Público: no necesita sesión.' })
  @ApiOkResponse({ schema: { example: { status: 'ok', timestamp: '2026-10-21T23:00:00.000Z' } } })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
