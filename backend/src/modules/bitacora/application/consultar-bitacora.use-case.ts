import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BITACORA_REPOSITORY, type BitacoraRepository } from '../domain/bitacora.repository.js';
import {
  type FiltrosBitacora,
  type RegistroBitacora,
  validarFiltrosBitacora,
} from '../domain/registro-bitacora.js';

// HU-25: consultar la bitácora con filtros por usuario, fecha y tipo de acción.
@Injectable()
export class ConsultarBitacoraUseCase {
  constructor(@Inject(BITACORA_REPOSITORY) private readonly bitacora: BitacoraRepository) {}

  async ejecutar(filtros: FiltrosBitacora): Promise<RegistroBitacora[]> {
    try {
      validarFiltrosBitacora(filtros);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.bitacora.consultar(filtros);
  }
}
