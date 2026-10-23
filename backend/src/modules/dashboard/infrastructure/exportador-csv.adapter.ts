import { Injectable } from '@nestjs/common';
import type { CeldaCsv, ExportadorCsv } from '../domain/exportador-csv.js';

// HU-34: arma el CSV a mano, sin librería.
// - Columnas separadas por coma y filas por salto de línea de Windows (\r\n).
// - Si una celda tiene coma, comillas o salto de línea, va entre comillas y
//   sus comillas se duplican ("Ferretería ""El Tornillo""").
// - Empieza con el BOM (﻿) para que Excel lo abra como UTF-8 y respete las tildes.
@Injectable()
export class ExportadorCsvAdapter implements ExportadorCsv {
  exportar(encabezados: string[], filas: CeldaCsv[][]): string {
    const lineas = [encabezados, ...filas].map((fila) => fila.map(celda).join(','));
    return '﻿' + lineas.join('\r\n') + '\r\n';
  }
}

function celda(valor: CeldaCsv): string {
  if (valor === null) return '';
  const texto = String(valor);
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}
