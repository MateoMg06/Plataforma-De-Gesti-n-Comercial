import { Inject, Injectable } from '@nestjs/common';
import {
  POTENCIAL_REPOSITORY,
  type PotencialRepository,
} from '../domain/potencial.repository.js';

@Injectable()
export class ListarPotencialesUseCase {
  constructor(
    @Inject(POTENCIAL_REPOSITORY)
    private readonly opciones: PotencialRepository,
  ) {}

  ejecutar() {
    return this.opciones.listar();
  }
}
