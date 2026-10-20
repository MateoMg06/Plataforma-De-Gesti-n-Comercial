import { Inject, Injectable } from '@nestjs/common';
import {
  ESTADO_CLIENTE_REPOSITORY,
  type EstadoClienteRepository,
} from '../domain/estado-cliente.repository.js';

@Injectable()
export class ListarEstadosClienteUseCase {
  constructor(
    @Inject(ESTADO_CLIENTE_REPOSITORY)
    private readonly opciones: EstadoClienteRepository,
  ) {}

  ejecutar() {
    return this.opciones.listar();
  }
}
