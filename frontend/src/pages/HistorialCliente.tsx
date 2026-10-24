import { CalendarCheck, ClipboardList, FileText, History, ShoppingCart, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import './HistorialCliente.css';

interface Evento {
  tipo: 'visita' | 'seguimiento' | 'cotizacion' | 'pedido';
  fecha: string;
  titulo: string;
  estado: string;
  detalle: string;
}

const ICONOS: Record<Evento['tipo'], LucideIcon> = {
  visita: CalendarCheck,
  seguimiento: ClipboardList,
  cotizacion: FileText,
  pedido: ShoppingCart,
};

const fecha = (texto: string) => new Date(texto).toLocaleDateString('es-CO', { dateStyle: 'medium' });

// HU-26 (Kevin B): línea de tiempo del cliente que se está editando, con
// visitas, seguimientos, cotizaciones y pedidos (del más reciente al más antiguo).
export function HistorialCliente({ idCliente }: { idCliente: number }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api<Evento[]>(`/seguimientos/cliente/${idCliente}`)
      .then(setEventos)
      .catch((e) => setError(e.message));
  }, [idCliente]);

  return (
    <div className="contactos">
      <h3 className="section-title">
        <History size={18} /> Historial del cliente
      </h3>
      {error && <p className="error">{error}</p>}
      {eventos.length === 0 ? (
        <p className="muted">Este cliente aún no tiene visitas, seguimientos, cotizaciones ni pedidos.</p>
      ) : (
        <ol className="historial">
          {eventos.map((e, i) => {
            const Icono = ICONOS[e.tipo];
            return (
              <li key={i} className={`historial-evento historial-${e.tipo}`}>
                <span className="historial-icono" aria-hidden="true">
                  <Icono size={16} />
                </span>
                <div>
                  <div className="historial-cabecera">
                    <strong>{e.titulo}</strong>
                    <span className={`pill pill-${e.estado}`}>{e.estado.replace('_', ' ')}</span>
                  </div>
                  <span className="muted">
                    {fecha(e.fecha)}
                    {e.detalle && ` · ${e.detalle}`}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
