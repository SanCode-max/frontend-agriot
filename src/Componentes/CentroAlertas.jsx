import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bell, Check, RefreshCw } from 'lucide-react';
import { apiFetch } from '../services/apiClient';
import '../css componentes/CentroAlertas.css';

const FILTERS = [['', 'Todas'], ['activa', 'Activas'], ['revisada', 'Revisadas'], ['resuelta', 'Resueltas']];
const LABELS = {
  humedad_baja: 'Humedad baja', humedad_excesiva: 'Humedad excesiva',
  temperatura_baja: 'Temperatura baja', temperatura_alta: 'Temperatura alta',
};

export default function CentroAlertas({ embedded = false }) {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    try {
      const query = new URLSearchParams({ limit: '200' });
      if (filter) query.set('estado', filter);
      const response = await apiFetch(`/alertas?${query}`);
      const data = await response.json();
      if (response.status === 401) { window.location.assign('/login'); return; }
      if (!response.ok) throw new Error(data.message || data.detail || 'No se pudieron cargar las alertas.');
      setAlerts(data.alertas || []);
      setError('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 30000);
    return () => window.clearInterval(interval);
  }, [load]);

  async function markReviewed(alert) {
    setUpdating(alert.id);
    try {
      const response = await apiFetch(`/alertas/${alert.id}/revisar`, { method: 'PATCH' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo actualizar la alerta.');
      await load();
    } catch (e) { setError(e.message); }
    finally { setUpdating(null); }
  }

  const dateTime = value => value ? new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  return <section className={`alerts-page ${embedded ? 'alerts-embedded' : ''}`}>
    <header className="alerts-heading"><div className="alerts-icon"><Bell size={22}/></div><div><span className="alerts-eyebrow">Monitoreo preventivo</span><h1>Centro de alertas</h1><p>Alertas generadas automáticamente a partir de la telemetría del ESP32.</p></div><button className="alerts-refresh" onClick={load} aria-label="Actualizar alertas"><RefreshCw size={17}/></button></header>
    <nav className="alerts-filters" aria-label="Filtrar alertas">{FILTERS.map(([value, label]) => <button type="button" key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</nav>
    {error && <p className="alerts-error" role="alert">{error}</p>}
    {loading ? <div className="alerts-empty">Cargando alertas…</div> : alerts.length === 0 ? <div className="alerts-empty"><Bell size={25}/><h2>Sin alertas para mostrar</h2><p>El historial aparecerá cuando una lectura supere los umbrales configurados.</p></div> : <div className="alerts-list">{alerts.map(alert => <article className={`alert-card severity-${alert.severidad} state-${alert.estado}`} key={alert.id}>
      <div className="alert-card-mark"><AlertTriangle size={19}/></div><div className="alert-card-main"><div className="alert-card-title"><div><span className="alert-kind">{LABELS[alert.tipo] || alert.tipo}</span><h2>{alert.cultivo?.nombre || `Dispositivo ${alert.device_id}`}</h2></div><span className={`alert-state state-${alert.estado}`}>{alert.estado}</span></div>
        <p className="alert-message">{alert.mensaje}</p><p className="alert-recommendation"><strong>Acción sugerida:</strong> {alert.recomendacion}</p>
        <div className="alert-meta"><span>{alert.valor != null ? `${alert.valor} ${alert.unidad || ''}` : 'Sin valor'}</span><span>Primera detección: {dateTime(alert.primera_deteccion_en)}</span><span>Última lectura: {dateTime(alert.ultima_deteccion_en)}</span></div>
      </div>{alert.estado === 'activa' && <button type="button" className="alert-review" onClick={() => markReviewed(alert)} disabled={updating === alert.id}><Check size={16}/>{updating === alert.id ? 'Guardando…' : 'Marcar revisada'}</button>}
    </article>)}</div>}
  </section>;
}
