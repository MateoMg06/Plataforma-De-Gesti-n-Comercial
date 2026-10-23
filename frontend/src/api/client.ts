// Cliente HTTP único para todo el frontend. Envía la cookie de sesión (BetterAuth).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

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
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Errores comunes de las dos funciones de archivos de abajo.
async function revisarRespuesta(res: Response): Promise<void> {
  if (res.status === 401) window.location.href = '/login';
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message ?? `Error ${res.status}`);
  }
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
