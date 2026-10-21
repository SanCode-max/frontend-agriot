import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { apiFetch } from '../services/apiClient';
import '../css componentes/NotificationBell.css';

const LABELS = {
  humedad_baja: 'Humedad baja', humedad_excesiva: 'Humedad excesiva',
  temperatura_baja: 'Temperatura baja', temperatura_alta: 'Temperatura alta',
};
const READ_KEY_PREFIX = 'agriot-alertas-leidas-v1';

function readIds(storageKey) {
  try { return new Set(JSON.parse(localStorage.getItem(storageKey) || '[]').map(String)); }
  catch (_) { return new Set(); }
}

const formatDate = value => value
  ? new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
  : 'Fecha no disponible';

export default function NotificationBell({ onOpenAlerts }) {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || '{}'); }
    catch (_) { return {}; }
  }, []);
  const storageKey = `${READ_KEY_PREFIX}:${user.id || user.correo || 'usuario'}`;
  const [alerts, setAlerts] = useState([]);
  const [readAlertIds, setReadAlertIds] = useState(() => readIds(storageKey));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlerts = useCallback(async () => {
    try {
      const response = await apiFetch('/alertas?limit=200');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.detail || 'No se pudieron cargar las alertas.');
      setAlerts(Array.isArray(data.alertas) ? data.alertas : []);
      setError('');
    } catch (e) {
      setError(e.message || 'No se pudieron cargar las alertas.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadAlerts();
    const timer = window.setInterval(loadAlerts, 15000);
    return () => window.clearInterval(timer);
  }, [loadAlerts]);

  useEffect(() => {
    const onPointerDown = event => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    const syncReadIds = event => {
      if (event.key === storageKey) setReadAlertIds(readIds(storageKey));
    };
    window.addEventListener('storage', syncReadIds);
    return () => window.removeEventListener('storage', syncReadIds);
  }, [storageKey]);

  const unreadCount = alerts.reduce((count, alert) => count + (readAlertIds.has(String(alert.id)) ? 0 : 1), 0);
  const latestAlerts = alerts.slice(0, 5);

  function openAlert(alert) {
    const nextRead = new Set(readAlertIds);
    nextRead.add(String(alert.id));
    setReadAlertIds(nextRead);
    localStorage.setItem(storageKey, JSON.stringify([...nextRead]));
    setOpen(false);
    if (onOpenAlerts) onOpenAlerts(alert);
    else navigate('/alertas', { state: { alertId: alert.id } });
  }

  function viewAll() {
    setOpen(false);
    if (onOpenAlerts) onOpenAlerts();
    else navigate('/alertas');
  }

  return <div className="agriot-notification" ref={wrapperRef}>
    <button type="button" className="agriot-notification-button" aria-label={`Notificaciones${unreadCount ? `, ${unreadCount} sin leer` : ''}`}
      aria-haspopup="dialog" aria-expanded={open} title="Notificaciones" onClick={() => setOpen(value => !value)}>
      <FaBell aria-hidden="true" />
      {unreadCount > 0 && <span className="agriot-notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>

    {open && <section className="agriot-notification-popover" role="dialog" aria-label="Notificaciones recientes">
      <header className="agriot-notification-heading"><div><strong>Notificaciones</strong><span>{unreadCount ? `${unreadCount} sin leer` : 'Todo al día'}</span></div>
        <button type="button" onClick={loadAlerts} aria-label="Actualizar notificaciones" title="Actualizar">↻</button>
      </header>
      {error ? <p className="agriot-notification-message" role="alert">{error}</p>
        : loading ? <p className="agriot-notification-message">Cargando alertas…</p>
          : latestAlerts.length === 0 ? <p className="agriot-notification-message">No hay alertas recientes.</p>
            : <ul className="agriot-notification-list">{latestAlerts.map(alert => {
              const unread = !readAlertIds.has(String(alert.id));
              return <li key={alert.id}>
                <button type="button" className={`agriot-notification-item ${unread ? 'is-unread' : ''}`} onClick={() => openAlert(alert)}>
                  <span className={`agriot-notification-severity severity-${alert.severidad || 'media'}`} />
                  <span className="agriot-notification-item-content">
                    <span className="agriot-notification-item-title">{LABELS[alert.tipo] || alert.mensaje || alert.tipo || 'Alerta de cultivo'}</span>
                    <span className="agriot-notification-item-meta">{alert.cultivo?.nombre || alert.device_id || `Cultivo #${alert.cultivo_id || '—'}`} · {alert.severidad || 'prioridad media'} · {alert.estado || 'activa'}</span>
                    <span className="agriot-notification-item-date">{formatDate(alert.primera_deteccion_en || alert.created_at)}</span>
                    {alert.recomendacion && <span className="agriot-notification-item-recommendation">{alert.recomendacion}</span>}
                  </span>
                  {unread && <span className="agriot-notification-unread-dot" aria-label="Sin leer" />}
                </button>
              </li>;
            })}</ul>}
      <button type="button" className="agriot-notification-all" onClick={viewAll}>Ver todas las alertas <span aria-hidden="true">→</span></button>
    </section>}
  </div>;
}
