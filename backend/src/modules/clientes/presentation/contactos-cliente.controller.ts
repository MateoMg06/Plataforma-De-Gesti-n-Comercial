import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CrearContactoUseCase } from '../application/crear-contacto.use-case.js';
import { EditarContactoUseCase } from '../application/editar-contacto.use-case.js';
import { EliminarContactoUseCase } from '../application/eliminar-contacto.use-case.js';
import { ListarContactosUseCase } from '../application/listar-contactos.use-case.js';
import { GuardarContactoDto } from './dto/guardar-contacto.dto.js';

// HU-07: contactos de un cliente bajo /api/clientes/:idCliente/contactos.
@ApiTags('Contactos de cliente')
@Controller('clientes/:idCliente/contactos')
export class ContactosClienteController {
  constructor(
    private readonly listarContactos: ListarContactosUseCase,
    private readonly crearContacto: CrearContactoUseCase,
    private readonly editarContacto: EditarContactoUseCase,
    private readonly eliminarContacto: EliminarContactoUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar contactos del cliente (el principal primero)' })
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  listar(@Param('idCliente', ParseIntPipe) idCliente: number) {
    return this.listarContactos.ejecutar(idCliente);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar contacto' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o ya hay un contacto principal.' })
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  crear(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Body() dto: GuardarContactoDto,
  ) {
    return this.crearContacto.ejecutar(idCliente, { ...dto, esPrincipal: dto.esPrincipal ?? false });
  }

  @Put(':idContacto')
  @ApiOperation({ summary: 'Editar contacto' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o ya hay un contacto principal.' })
  @ApiNotFoundResponse({ description: 'El contacto no existe.' })
  editar(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idContacto', ParseIntPipe) idContacto: number,
    @Body() dto: GuardarContactoDto,
  ) {
    return this.editarContacto.ejecutar(idCliente, idContacto, { ...dto, esPrincipal: dto.esPrincipal ?? false });
  }

  @Delete(':idContacto')
  @ApiOperation({ summary: 'Eliminar contacto' })
  @ApiNotFoundResponse({ description: 'El contacto no existe.' })
  async eliminar(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idContacto', ParseIntPipe) idContacto: number,
  ) {
    await this.eliminarContacto.ejecutar(idCliente, idContacto);
    return { mensaje: 'Contacto eliminado' };
  }
}
