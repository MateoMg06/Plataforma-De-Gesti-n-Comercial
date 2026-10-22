export type DatosContacto = {
  nombre: string;
  cargo: string;
  telefono: string;
  celular: string;
  email: string;
  principal: boolean;
};

export class ContactoCliente {
  constructor(
    public readonly id: number | null,
    public readonly idCliente: number,
    public readonly datos: DatosContacto,
  ) {}

  static crear(
    idCliente: number,
    datos: DatosContacto,
    contactos: ContactoCliente[],
    id: number | null = null,
  ): ContactoCliente {
    const normalizados = { ...datos };
    for (const campo of [
      'nombre',
      'cargo',
      'telefono',
      'celular',
      'email',
    ] as const) {
      normalizados[campo] = datos[campo].trim();
    }
    if (!normalizados.nombre) throw new Error('El nombre es obligatorio');
    if (
      datos.principal &&
      contactos.some(
        (c) => c.idCliente === idCliente && c.id !== id && c.datos.principal,
      )
    ) {
      throw new Error('El cliente ya tiene un contacto principal');
    }
    normalizados.email = normalizados.email.toLowerCase();
    return new ContactoCliente(id, idCliente, normalizados);
  }
}
