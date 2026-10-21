// Catálogo RESULTADO_VISITA: qué pasó en la visita (ej. "Cobro", "Demostración").
export type ResultadoVisita = {
  id: number;
  nombre: string;
};

// Un resultado registrado en una visita, con su observación (tabla VISITA_RESULTADO).
export type ResultadoRegistrado = {
  idResultado: number;
  observacion: string;
};
