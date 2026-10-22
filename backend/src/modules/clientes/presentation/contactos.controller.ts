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
import { ApiTags } from '@nestjs/swagger';
import { CrearContactoUseCase } from '../application/crear-contacto.use-case.js';
import { EditarContactoUseCase } from '../application/editar-contacto.use-case.js';
import { EliminarContactoUseCase } from '../application/eliminar-contacto.use-case.js';
import { ListarContactosUseCase } from '../application/listar-contactos.use-case.js';
import { GuardarContactoDto } from './dto/guardar-contacto.dto.js';
@ApiTags('Contactos de clientes')
@Controller('clientes/:idCliente/contactos')
export class ContactosController {
  constructor(
    private readonly crear: CrearContactoUseCase,
    private readonly editar: EditarContactoUseCase,
    private readonly eliminar: EliminarContactoUseCase,
    private readonly listar: ListarContactosUseCase,
  ) {}
  @Get()
  consultar(@Param('idCliente', ParseIntPipe) idCliente: number) {
    return this.listar.ejecutar(idCliente);
  }
  @Post()
  registrar(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Body() dto: GuardarContactoDto,
  ) {
    return this.crear.ejecutar(idCliente, dto);
  }
  @Put(':id')
  actualizar(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GuardarContactoDto,
  ) {
    return this.editar.ejecutar(idCliente, id, dto);
  }
  @Delete(':id')
  borrar(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.eliminar.ejecutar(idCliente, id);
  }
}
