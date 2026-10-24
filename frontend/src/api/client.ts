// Cliente HTTP único para todo el frontend. Envía la cookie de sesión (BetterAuth).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// BetterAuth responde sus errores en inglés con un "code". Aquí se traducen los
// que puede ver un usuario de Comercial 360 (login y administración de usuarios).
const ERRORES_BETTER_AUTH: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Correo o contraseña incorrectos',
  BANNED_USER: 'Tu usuario está desactivado. Habla con el administrador.',
  USER_ALREADY_EXISTS: 'Ya existe un usuario con ese correo',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Ya existe un usuario con ese correo',
  INVALID_EMAIL: 'El correo no es válido',
  PASSWORD_TOO_SHORT: 'La contraseña es muy corta (mínimo 8 caracteres)',
  PASSWORD_TOO_LONG: 'La contraseña es muy larga',
  USER_NOT_FOUND: 'El usuario no existe',
  YOU_CANNOT_BAN_YOURSELF: 'No puedes desactivar tu propio usuario',
};

// Convierte una respuesta con error en un mensaje en español.
async function mensajeDeError(res: Response): Promise<string> {
  if (res.status === 429) return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
  const body = await res.json().catch(() => ({}));
  if (body.code && ERRORES_BETTER_AUTH[body.code]) return ERRORES_BETTER_AUTH[body.code];
  const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
  return message ?? `Error ${res.status}`;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 401 && window.location.pathname !== '/login') {
    // HU-02: al perder la sesión se vuelve al login.
    // En /login el 401 significa "credenciales malas" (HU-01), así que ahí no
    // se redirige: si no, la página se recargaría y se perdería el mensaje de error.
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(await mensajeDeError(res));
  return res.json() as Promise<T>;
}

// Errores comunes de las dos funciones de archivos de abajo.
async function revisarRespuesta(res: Response): Promise<void> {
  if (res.status === 401) window.location.href = '/login';
  if (!res.ok) throw new Error(await mensajeDeError(res));
}

// HU-29: subir un archivo. Va como FormData, así que NO se pone Content-Type:
// el navegador lo arma solo (multipart/form-data con su separador).
export async function apiSubirArchivo<T>(path: string, campo: string, archivo: File): Promise<T> {
  const datos = new FormData();
  datos.append(campo, archivo);
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', credentials: 'include', body: datos });
  await revisarRespuesta(res);
  return res.json() as Promise<T>;
}

// HU-29: descargar un archivo y guardarlo en el computador del usuario.
export async function apiDescargarArchivo(path: string, nombre: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include' });
  await revisarRespuesta(res);
  const url = URL.createObjectURL(await res.blob());
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Algunas pantallas necesitan TODOS los clientes (para mostrar nombres en vez de
// ids). El backend entrega máximo 100 por página, así que se piden las páginas
// necesarias. Con rol asesor el backend ya devuelve solo sus clientes.
export async function apiTodosLosClientes<T extends { id: number }>(): Promise<T[]> {
  const clientes: T[] = [];
  for (let page = 1; ; page++) {
    const pagina = await api<{ datos: T[]; total: number }>(`/clientes?page=${page}&limit=100`);
    clientes.push(...pagina.datos);
    if (clientes.length >= pagina.total || pagina.datos.length === 0) return clientes;
  }
}
