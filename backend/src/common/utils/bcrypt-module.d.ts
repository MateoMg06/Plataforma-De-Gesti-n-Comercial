// Tipos de las dos funciones de bcrypt utilizadas por el proyecto.
declare module 'bcrypt' {
  export function hash(password: string, saltRounds: number): Promise<string>;
  export function compare(password: string, hashedPassword: string): Promise<boolean>;
}
