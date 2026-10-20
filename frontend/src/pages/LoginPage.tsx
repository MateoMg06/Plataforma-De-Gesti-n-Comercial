import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

// Basado en diseno_01. TODO HU-01 (Kevin V): conectar con BetterAuth.
export function LoginPage() {
  const navigate = useNavigate();

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
        <form
          className="card login-form"
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
        >
          <h1>Iniciar sesión</h1>
          <p className="muted">Ingresa con tu correo corporativo para acceder a la plataforma</p>
          <label>
            Correo electrónico
            <div className="input-icon">
              <Mail size={18} />
              <input className="input" type="email" placeholder="tuusuario@empresa.com" required />
            </div>
          </label>
          <label>
            Contraseña
            <div className="input-icon">
              <Lock size={18} />
              <input className="input" type="password" placeholder="Ingresa tu contraseña" required />
            </div>
          </label>
          <button className="btn btn-primary">Iniciar sesión</button>
        </form>
      </section>
    </div>
  );
}
