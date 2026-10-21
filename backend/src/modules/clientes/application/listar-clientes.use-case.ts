import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  type ClienteRepository,
  type ConsultaClientes,
} from '../domain/cliente.repository.js';

@Injectable()
export class ListarClientesUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository,
  ) {}

  ejecutar(consulta: ConsultaClientes) {
    if (
      !Number.isInteger(consulta.page) ||
      consulta.page < 1 ||
      !Number.isInteger(consulta.limit) ||
      consulta.limit < 1 ||
      consulta.limit > 100
    ) {
      throw new BadRequestException(
        'page debe ser positivo y limit debe estar entre 1 y 100',
      );
    }
    return this.clientes.listar({
      ...consulta,
      busqueda: consulta.busqueda?.trim(),
    });
  }
}
