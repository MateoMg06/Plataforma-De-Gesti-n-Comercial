import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConvertirCotizacionEnPedidoUseCase } from '../application/convertir-cotizacion-en-pedido.use-case.js';
import { CrearCotizacionUseCase } from '../application/crear-cotizacion.use-case.js';
import { ListarCotizacionesUseCase } from '../application/listar-cotizaciones.use-case.js';
import { EnviarCotizacionUseCase } from '../application/enviar-cotizacion.use-case.js';
import { AprobarCotizacionUseCase } from '../application/aprobar-cotizacion.use-case.js';
import { RechazarCotizacionUseCase } from '../application/rechazar-cotizacion.use-case.js';
import { RegistrarEnBitacora } from '../../bitacora/infrastructure/bitacora.decorator.js';
import { CrearCotizacionDto } from './dto/crear-cotizacion.dto.js';

// Ejemplo de cotización para la documentación (total calculado por el dominio).
const cotizacionEjemplo = {
  id: 1,
  numero: 1001,
  idCliente: 1,
  idAsesor: 1,
  fecha: '2026-10-21T17:00:00.000Z',
  estado: 'borrador',
  total: 9850000,
  detalles: [
    { id: 1, producto: 'Equipo de soldadura', cantidad: 2, precio: 4500000, subtotal: 9000000 },
    { id: 2, producto: 'Kit de protección', cantidad: 10, precio: 85000, subtotal: 850000 },
  ],
};

// Estados: borrador -> enviada -> aprobada | rechazada (HU-28). Cada cambio va a la bitácora.
@ApiTags('Cotizaciones')
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(
    private readonly crearCotizacion: CrearCotizacionUseCase,
    private readonly listarCotizaciones: ListarCotizacionesUseCase,
    private readonly enviarCotizacion: EnviarCotizacionUseCase,
    private readonly aprobarCotizacion: AprobarCotizacionUseCase,
    private readonly rechazarCotizacion: RechazarCotizacionUseCase,
    private readonly convertirEnPedido: ConvertirCotizacionEnPedidoUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar cotizaciones' })
  @ApiOkResponse({ schema: { example: [cotizacionEjemplo] } })
  listar() {
    return this.listarCotizaciones.ejecutar();
  }

  @Post()
  @RegistrarEnBitacora('crear_cotizacion')
  @ApiOperation({
    summary: 'Crear cotización (HU-27)',
    description: 'Número automático y único. Subtotales y total los calcula el backend. Queda en borrador.',
  })
  @ApiCreatedResponse({ schema: { example: cotizacionEjemplo } })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiNotFoundResponse({ description: 'El cliente o el asesor no existen.' })
  crear(@Body() dto: CrearCotizacionDto) {
    return this.crearCotizacion.ejecutar(dto.idCliente, dto.idAsesor, dto.detalles);
  }

  @Patch(':id/enviar')
  @RegistrarEnBitacora('editar_cotizacion')
  @ApiOperation({ summary: 'Enviar cotización (borrador → enviada)' })
  @ApiBadRequestResponse({ description: 'Transición no permitida.' })
  @ApiNotFoundResponse({ description: 'La cotización no existe.' })
  enviar(@Param('id', ParseIntPipe) id: number) {
    return this.enviarCotizacion.ejecutar(id);
  }

  @Patch(':id/aprobar')
  @RegistrarEnBitacora('editar_cotizacion')
  @ApiOperation({ summary: 'Aprobar cotización (enviada → aprobada)' })
  @ApiBadRequestResponse({ description: 'Transición no permitida.' })
  @ApiNotFoundResponse({ description: 'La cotización no existe.' })
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.aprobarCotizacion.ejecutar(id);
  }

  @Patch(':id/rechazar')
  @RegistrarEnBitacora('editar_cotizacion')
  @ApiOperation({ summary: 'Rechazar cotización (enviada → rechazada)' })
  @ApiBadRequestResponse({ description: 'Transición no permitida.' })
  @ApiNotFoundResponse({ description: 'La cotización no existe.' })
  rechazar(@Param('id', ParseIntPipe) id: number) {
    return this.rechazarCotizacion.ejecutar(id);
  }

  @Post(':id/convertir-pedido')
  @RegistrarEnBitacora('crear_pedido')
  @ApiOperation({
    summary: 'Convertir cotización en pedido (HU-30)',
    description: 'Solo cotizaciones aprobadas. El pedido hereda cliente y valor. Una cotización genera un solo pedido.',
  })
  @ApiCreatedResponse({
    schema: { example: { id: 1, numero: 1, idCotizacion: 1, idCliente: 1, valor: 9850000, estado: 'pendiente', fecha: '2026-10-21T14:00:00.000Z' } },
  })
  @ApiBadRequestResponse({ description: 'La cotización no está aprobada.' })
  @ApiNotFoundResponse({ description: 'La cotización no existe.' })
  @ApiConflictResponse({ description: 'La cotización ya se convirtió en pedido.' })
  convertir(@Param('id', ParseIntPipe) id: number) {
    return this.convertirEnPedido.ejecutar(id);
  }
}
