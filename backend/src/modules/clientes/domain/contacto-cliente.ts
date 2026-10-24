// Entidad de dominio (HU-07): un contacto de un cliente.
export class ContactoCliente {
  constructor(
    public readonly id: number | null,
    public readonly idCliente: number,
    public readonly nombre: string,
    public readonly cargo: string,
    public readonly telefono: string,
    public readonly celular: string,
    public readonly email: string,
    public readonly esPrincipal: boolean,
  ) {
    if (!nombre.trim()) throw new Error('El nombre del contacto es obligatorio');
    if (nombre.length > 150)
      throw new Error('El nombre admite máximo 150 caracteres');
    if (!telefono.trim() && !celular.trim())
      throw new Error('El contacto necesita un teléfono o un celular');
  }

  static crear(
    idCliente: number,
    nombre: string,
    cargo: string,
    telefono: string,
    celular: string,
    email: string,
    esPrincipal: boolean,
  ): ContactoCliente {
    return new ContactoCliente(
      null,
      idCliente,
      nombre.trim(),
      cargo.trim(),
      telefono.trim(),
      celular.trim(),
      email.trim().toLowerCase(),
      esPrincipal,
    );
  }

  editar(
    nombre: string,
    cargo: string,
    telefono: string,
    celular: string,
    email: string,
    esPrincipal: boolean,
  ): ContactoCliente {
    return new ContactoCliente(
      this.id,
      this.idCliente,
      nombre.trim(),
      cargo.trim(),
      telefono.trim(),
      celular.trim(),
      email.trim().toLowerCase(),
      esPrincipal,
    );
  }

  // Regla HU-07: solo un contacto principal por cliente.
  // Recibe los contactos que ya tiene el cliente y falla si este contacto
  // quiere ser principal y ya hay otro principal.
  validarPrincipalUnico(contactosDelCliente: ContactoCliente[]): void {
    if (!this.esPrincipal) return;
    const otroPrincipal = contactosDelCliente.some(
      (c) => c.esPrincipal && c.id !== this.id,
    );
    if (otroPrincipal)
      throw new Error('El cliente ya tiene un contacto principal');
  }
}
