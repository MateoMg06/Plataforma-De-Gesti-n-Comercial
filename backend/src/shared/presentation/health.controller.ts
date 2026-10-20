import { Controller, Get } from '@nestjs/common';

// Jenkins y el despliegue en EC2 usan este endpoint para saber si la app está viva.
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
