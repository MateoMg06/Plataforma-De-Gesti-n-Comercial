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
import { AgregarClienteRutaUseCase } from '../application/agregar-cliente-ruta.use-case.js';
import { CrearRutaUseCase } from '../application/crear-ruta.use-case.js';
import { ListarRutasUseCase } from '../application/listar-rutas.use-case.js';
import { ReordenarClienteRutaUseCase } from '../application/reordenar-cliente-ruta.use-case.js';
import { AgregarClienteRutaDto } from './dto/agregar-cliente-ruta.dto.js';
import { CrearRutaDto } from './dto/crear-ruta.dto.js';
import { ReordenarClienteRutaDto } from './dto/reordenar-cliente-ruta.dto.js';

@Controller('rutas')
@ApiTags('Rutas')
export class RutasController {
  constructor(
    private readonly crearRuta: CrearRutaUseCase,
    private readonly listarRutas: ListarRutasUseCase,
    private readonly agregarCliente: AgregarClienteRutaUseCase,
    private readonly reordenarCliente: ReordenarClienteRutaUseCase,
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
  listar() {
    return this.listarRutas.ejecutar();
  }

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
}
