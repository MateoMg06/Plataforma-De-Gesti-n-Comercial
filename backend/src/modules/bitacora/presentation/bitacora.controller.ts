import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@thallesp/nestjs-better-auth';
import { ConsultarBitacoraUseCase } from '../application/consultar-bitacora.use-case.js';
import { ConsultarBitacoraDto } from './dto/consultar-bitacora.dto.js';

// Presentación: valida los filtros con el DTO y delega en el caso de uso.
@ApiTags('Bitácora')
@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly consultar: ConsultarBitacoraUseCase) {}

  @Get()
  @Roles(['administrador', 'lider'])
  @ApiOperation({
    summary: 'Consultar la bitácora (HU-25)',
    description: 'Quién, cuándo y qué. Filtros combinables por usuario, tipo de acción y fechas. Del más reciente al más antiguo.',
  })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 1,
          usuarioId: 'u-laura',
          usuarioNombre: 'Laura Gómez',
          accion: 'crear_cliente',
          modulo: 'clientes',
          fecha: '2026-10-22T15:00:00.000Z',
          detalle: 'POST /api/clientes - crear_cliente',
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Filtro inválido o rango de fechas al revés.' })
  listar(@Query() dto: ConsultarBitacoraDto) {
    // "hasta" incluye todo ese día: se busca hasta el inicio del día siguiente.
    const hasta = dto.hasta ? new Date(`${dto.hasta}T00:00:00`) : undefined;
    hasta?.setDate(hasta.getDate() + 1);
    return this.consultar.ejecutar({
      usuarioId: dto.usuarioId,
      accion: dto.accion,
      desde: dto.desde ? new Date(`${dto.desde}T00:00:00`) : undefined,
      hasta,
    });
  }
}
