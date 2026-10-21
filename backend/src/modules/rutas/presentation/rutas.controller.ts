import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ActivarRutaUseCase } from '../application/activar-ruta.use-case.js';
import { AgregarClienteRutaUseCase } from '../application/agregar-cliente-ruta.use-case.js';
import { FinalizarRutaUseCase } from '../application/finalizar-ruta.use-case.js';
import { CrearRutaUseCase } from '../application/crear-ruta.use-case.js';
import { ListarRutasUseCase } from '../application/listar-rutas.use-case.js';
import { ReordenarClienteRutaUseCase } from '../application/reordenar-cliente-ruta.use-case.js';
import { AgregarClienteRutaDto } from './dto/agregar-cliente-ruta.dto.js';
import { CrearRutaDto } from './dto/crear-ruta.dto.js';
import { ReordenarClienteRutaDto } from './dto/reordenar-cliente-ruta.dto.js';

// HU-03: crear y modificar rutas es solo para administrador y líder.
@Controller('rutas')
@ApiTags('Rutas')
export class RutasController {
  constructor(
    private readonly crearRuta: CrearRutaUseCase,
    private readonly listarRutas: ListarRutasUseCase,
    private readonly agregarCliente: AgregarClienteRutaUseCase,
    private readonly reordenarCliente: ReordenarClienteRutaUseCase,
    private readonly activarRuta: ActivarRutaUseCase,
    private readonly finalizarRuta: FinalizarRutaUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar rutas con sus clientes ordenados' })
  @ApiOkResponse({
    description: 'Rutas encontradas',
    schema: {
      example: [{
        id: 1,
        nombre: 'Ruta norte',
        idAsesor: 1,
        fechaInicio: '2026-10-20',
        fechaFin: '2026-10-22',
        estado: 'planeada',
        clientes: [{ idCliente: 101, ordenVisita: 1 }],
      }],
    },
  })
  // HU-03: con rol asesor solo devuelve sus rutas.
  listar(@Session() session: UserSession) {
    return this.listarRutas.ejecutar({ id: session.user.id, role: session.user.role as string });
  }

  @Roles(['administrador', 'lider'])
  @Post()
  @ApiOperation({ summary: 'Crear una ruta en estado planeada' })
  @ApiCreatedResponse({
    description: 'Ruta creada',
    schema: {
      example: {
        id: 1,
        nombre: 'Ruta norte',
        idAsesor: 1,
        fechaInicio: '2026-10-20',
        fechaFin: '2026-10-22',
        estado: 'planeada',
        clientes: [],
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos o rango de fechas incorrecto' })
  crear(@Body() dto: CrearRutaDto) {
    return this.crearRuta.ejecutar(
      dto.nombre,
      dto.id_asesor,
      dto.fecha_inicio,
      dto.fecha_fin,
    );
  }

  @Roles(['administrador', 'lider'])
  @Post(':id/clientes')
  @ApiOperation({ summary: 'Agregar un cliente al final del orden de visita' })
  @ApiParam({ name: 'id', description: 'ID de la ruta', example: 1, type: Number })
  @ApiCreatedResponse({
    description: 'Cliente agregado a la ruta',
    schema: {
      example: {
        id: 1,
        nombre: 'Ruta norte',
        estado: 'planeada',
        clientes: [
          { idCliente: 101, ordenVisita: 1 },
          { idCliente: 202, ordenVisita: 2 },
        ],
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID de cliente inválido o cliente duplicado en la ruta' })
  @ApiNotFoundResponse({ description: 'No existe la ruta indicada' })
  agregar(
    @Param('id', ParseIntPipe) idRuta: number,
    @Body() dto: AgregarClienteRutaDto,
  ) {
    return this.agregarCliente.ejecutar(idRuta, dto.id_cliente);
  }

  @Roles(['administrador', 'lider'])
  @Patch(':id/clientes/:idCliente/orden')
  @ApiOperation({ summary: 'Cambiar el orden de visita de un cliente' })
  @ApiParam({ name: 'id', description: 'ID de la ruta', example: 1, type: Number })
  @ApiParam({ name: 'idCliente', description: 'ID del cliente dentro de la ruta', example: 202, type: Number })
  @ApiOkResponse({
    description: 'Orden actualizado y secuencia renumerada',
    schema: {
      example: {
        id: 1,
        nombre: 'Ruta norte',
        estado: 'planeada',
        clientes: [
          { idCliente: 202, ordenVisita: 1 },
          { idCliente: 101, ordenVisita: 2 },
        ],
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Cliente ajeno a la ruta u orden inválido' })
  @ApiNotFoundResponse({ description: 'No existe la ruta indicada' })
  reordenar(
    @Param('id', ParseIntPipe) idRuta: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Body() dto: ReordenarClienteRutaDto,
  ) {
    return this.reordenarCliente.ejecutar(idRuta, idCliente, dto.orden_visita);
  }

  @Roles(['administrador', 'lider'])
  @Patch(':id/activar')
  @ApiOperation({ summary: 'HU-16: activar la ruta y generar sus visitas' })
  @ApiParam({ name: 'id', description: 'ID de la ruta', example: 1, type: Number })
  @ApiBadRequestResponse({ description: 'La ruta no está planeada o no tiene clientes' })
  @ApiNotFoundResponse({ description: 'No existe la ruta indicada' })
  activar(@Param('id', ParseIntPipe) idRuta: number) {
    return this.activarRuta.ejecutar(idRuta);
  }

  @Roles(['administrador', 'lider'])
  @Patch(':id/finalizar')
  @ApiOperation({ summary: 'HU-16: finalizar la ruta (ya no admite cambios)' })
  @ApiParam({ name: 'id', description: 'ID de la ruta', example: 1, type: Number })
  @ApiBadRequestResponse({ description: 'La ruta no está activa' })
  @ApiNotFoundResponse({ description: 'No existe la ruta indicada' })
  finalizar(@Param('id', ParseIntPipe) idRuta: number) {
    return this.finalizarRuta.ejecutar(idRuta);
  }
}
