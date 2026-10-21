import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import '../css componentes/CultivoMonitoreo.css';

function normalizeTelemetryResponse(responseData) {
  const rows = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.telemetria)
      ? responseData.telemetria
      : Array.isArray(responseData?.data?.telemetria)
        ? responseData.data.telemetria
        : Array.isArray(responseData?.data)
          ? responseData.data
          : [];

  return rows.map(row => ({
    ...row,
    temperatura_suelo_C: row.temperatura_suelo_C ?? row.temperatura_suelo ?? row.temperature_c ?? row.temperature,
    humedad_relativa_calibrada_pct: row.humedad_relativa_calibrada_pct ?? row.humedad_suelo_pct ?? row.humedad_suelo ?? row.soil_moisture_pct,
    observed_at: row.observed_at ?? row.timestamp ?? row.created_at,
  }));
}

function apiErrorMessage(data, fallback) {
  const validationMessages = Object.values(data?.errors || {}).flat().filter(Boolean);
  return data?.detail || data?.message || validationMessages.join(' ') || fallback;
}

function LineChart({ data, field, color, unit, label }) {
  const values = data.map(point => point[field] == null ? NaN : Number(point[field])).filter(Number.isFinite);
  if (!values.length) return <div className="telemetry-empty">Aún no hay lecturas de {label.toLowerCase()}.</div>;
  const width = 720; const height = 220; const pad = { top: 20, right: 18, bottom: 36, left: 48 };
  const min = Math.min(...values); const max = Math.max(...values); const span = max - min || 1;
  const points = data.map((point, index) => ({
    value: point[field] == null ? NaN : Number(point[field]), observedAt: point.observed_at || point.timestamp,
    x: pad.left + (data.length < 2 ? (width - pad.left - pad.right) / 2 : index * (width - pad.left - pad.right) / (data.length - 1)),
  })).filter(point => Number.isFinite(point.value)).map(point => ({ ...point, y: pad.top + (max - point.value) / span * (height - pad.top - pad.bottom) }));
  const line = points.map(point => `${point.x},${point.y}`).join(' ');
  const latest = values[values.length - 1];
  const formatTime = value => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };
  return <div className="telemetry-chart-wrap">
    <div className="telemetry-current"><strong>{latest.toFixed(1)}</strong><span>{unit}</span></div>
    <svg className="telemetry-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label} a través del tiempo`}>
      {[0, 1, 2, 3].map(tick => { const y = pad.top + tick * (height - pad.top - pad.bottom) / 3; const value = max - tick * span / 3; return <g key={tick}><line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#e9eee8"/><text x={pad.left - 9} y={y + 4} textAnchor="end" fill="#819086" fontSize="11">{value.toFixed(1)}</text></g>; })}
      <polyline points={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
      {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3.5" fill="white" stroke={color} strokeWidth="2"><title>{`${formatTime(point.observedAt)}: ${point.value} ${unit}`}</title></circle>)}
      {points.length > 0 && <><text x={pad.left} y={height - 8} fill="#819086" fontSize="11">{formatTime(data[0]?.observed_at || data[0]?.timestamp)}</text><text x={width - pad.right} y={height - 8} textAnchor="end" fill="#819086" fontSize="11">{formatTime(data[data.length - 1]?.observed_at || data[data.length - 1]?.timestamp)}</text></>}
    </svg>
  </div>;
}

export default function CultivoMonitoreo() {
  const { id } = useParams(); const navigate = useNavigate(); const location = useLocation();
  const [cultivo, setCultivo] = useState(null); const [telemetria, setTelemetria] = useState([]);
  const [error, setError] = useState(''); const [telemetryError, setTelemetryError] = useState(''); const [updatedAt, setUpdatedAt] = useState(null);
  const loadTelemetry = useCallback(async () => {
    try {
      const response = await apiFetch(`/v1/cultivos/${id}/telemetria?limit=500`);
      const data = await response.json();
      if (response.status === 403 && data.must_change_password) { navigate('/cambiar-password', { replace: true }); return; }
      if (response.status === 401) { navigate('/login', { replace: true }); return; }
      if (!response.ok) throw new Error(apiErrorMessage(data, 'No se pudo actualizar la telemetría.'));
      setTelemetria(normalizeTelemetryResponse(data)); setUpdatedAt(new Date()); setTelemetryError('');
    } catch (e) { setTelemetryError(e.message); }
  }, [id, navigate]);

  useEffect(() => {
    let mounted = true;
    apiFetch(`/cultivos/${id}`).then(async response => {
      const data = await response.json();
      if (response.status === 403 && data.must_change_password) { navigate('/cambiar-password', { replace: true }); return; }
      if (response.status === 401) { navigate('/login', { replace: true }); return; }
      if (!response.ok) throw new Error(response.status === 404 ? 'No tienes acceso a este cultivo o ya no existe.' : apiErrorMessage(data, 'No se pudo cargar el cultivo.'));
      if (mounted) setCultivo(data.cultivo);
    }).catch(e => mounted && setError(e.message));
    return () => { mounted = false; };
  }, [id, navigate]);

  useEffect(() => {
    if (!cultivo) return undefined;
    loadTelemetry();
    const timer = window.setInterval(loadTelemetry, 15000);
    return () => window.clearInterval(timer);
  }, [cultivo, loadTelemetry]);
  const user = useMemo(() => JSON.parse(localStorage.getItem('usuario') || '{}'), []);
  if (error) return <main className="monitor-page"><button className="monitor-back" onClick={() => navigate(-1)}>← Volver</button><section className="monitor-error"><h1>Cultivo no disponible</h1><p>{error}</p></section></main>;
  if (!cultivo) return <main className="monitor-page"><div className="monitor-loading">Cargando datos del cultivo…</div></main>;

  return <main className="monitor-page">
    <header className="monitor-topbar"><button className="monitor-back" onClick={() => navigate(location.state?.from || (user.rol === 'user' ? '/dashboard/usuario' : '/Inicio'))}>← Mis cultivos</button><span className="monitor-brand">Agr<span>IoT</span></span><span className="monitor-live"><i/>Actualización cada 15 s</span></header>
    <section className="monitor-heading"><div><span className="monitor-eyebrow">Sub-dashboard de monitoreo</span><h1>{cultivo.nombre}</h1><p>{cultivo.ubicacion} · Nodo <b>{cultivo.device_id}</b></p></div><span className="monitor-state">{cultivo.estado_actual}</span></section>
    <section className="telemetry-grid">
      <article className="panel telemetry-panel"><div className="panel-title"><div><span className="monitor-eyebrow">Agua disponible</span><h2>Humedad del suelo (%)</h2></div><span className="telemetry-dot humidity"/></div><LineChart data={telemetria} field="humedad_relativa_calibrada_pct" color="#3c9b7a" unit="%" label="Humedad del suelo"/></article>
      <article className="panel telemetry-panel"><div className="panel-title"><div><span className="monitor-eyebrow">Temperatura edáfica</span><h2>Temperatura del suelo (°C)</h2></div><span className="telemetry-dot temperature"/></div><LineChart data={telemetria} field="temperatura_suelo_C" color="#e99431" unit="°C" label="Temperatura del suelo"/></article>
    </section>
    <div className="telemetry-footer"><span>{telemetryError ? `Error de actualización: ${telemetryError}` : updatedAt ? `Última actualización: ${updatedAt.toLocaleTimeString()}` : 'Consultando lecturas…'}</span><span>{telemetria.length} lecturas históricas</span></div>
  </main>;
}
