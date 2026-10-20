import { Lock, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import './LoginPage.css';

// Respuesta que BetterAuth devuelve en POST /auth/sign-in/email.
type Sesion = {
  user: { id: string; name: string; email: string };
  token: string;
};

// Basado en diseno_01. HU-01 (Kevin V): login real con BetterAuth.
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setError('');
    setCargando(true);
    try {
      // BetterAuth crea la sesión y deja la cookie httpOnly en el navegador.
      await api<Sesion>('/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      navigate('/dashboard');
    } catch (e) {
      // Mensaje del backend ("Invalid email or password"). Nunca se muestra
      // la contraseña ni datos internos.
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login">
      <section className="login-hero">
        <div className="brand-lg">
          <img src="/favicon.svg" alt="" width={48} height={48} /> Comercial 360
        </div>
        <h2>Plataforma de Gestión Comercial</h2>
        <p>Administra tus rutas, visitas y clientes de manera eficiente y en tiempo real.</p>
      </section>
      <section className="login-form-wrap">
        <form className="card login-form" onSubmit={enviar}>
          <h1>Iniciar sesión</h1>
          <p className="muted">Ingresa con tu correo corporativo para acceder a la plataforma</p>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          <label>
            Correo electrónico
            <div className="input-icon">
              <Mail size={18} />
              <input
                className="input"
                type="email"
                placeholder="tuusuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>
          <label>
            Contraseña
            <div className="input-icon">
              <Lock size={18} />
              <input
                className="input"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>
          <button className="btn btn-primary" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </div>
  );
}
