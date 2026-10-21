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
