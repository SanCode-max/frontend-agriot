import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Droplets, FlaskConical, RefreshCw, Sprout, TriangleAlert } from 'lucide-react';
import { apiFetch } from '../services/apiClient';
import '../css componentes/ReportesEstadisticas.css';

const DAY_MS = 86400000;
const WEEK_MS = 7 * DAY_MS;
const aliases = {
  ph: ['ph', 'ph_suelo', 'ph_sustrato', 'ph_actual', 'ph_actual_suelo'],
  humedad: ['humedad_relativa_calibrada_pct', 'humedad_suelo_pct', 'humedad_sustrato_pct', 'humedad_pct', 'soil_moisture_pct'],
  temperatura: ['temperatura_suelo_C', 'temperatura_suelo_c', 'temperatura_c', 'soil_temperature_c'],
  ce: ['ce', 'ce_ms_cm', 'conductividad_electrica', 'conductividad_electrica_ms_cm'],
  riego: ['riego_litros', 'volumen_riego_l', 'water_volume_l', 'irrigation_volume_l'],
};

function payloadOf(row) {
  if (!row?.payload) return {};
  if (typeof row.payload === 'object') return row.payload;
  try { return JSON.parse(row.payload); } catch { return {}; }
}
function numeric(row, keys) {
  const payload = payloadOf(row);
  for (const key of keys) {
    const value = row?.[key] ?? payload[key];
    if (value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}
function observedAt(row) {
  const value = row?.observed_at || row?.timestamp || row?.created_at;
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
}
function average(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}
function stability(row) {
  const scores = [];
  const ph = numeric(row, aliases.ph);
  const humidity = numeric(row, aliases.humedad);
  const temperature = numeric(row, aliases.temperatura);
  const ec = numeric(row, aliases.ce);
  if (ph !== null) scores.push(ph >= 4.5 && ph <= 5.5 ? 100 : Math.max(0, 100 - Math.min(Math.abs(ph - (ph < 4.5 ? 4.5 : 5.5)) * 35, 100)));
  if (humidity !== null) scores.push(humidity >= 40 && humidity <= 85 ? 100 : Math.max(0, 100 - Math.min(Math.abs(humidity - (humidity < 40 ? 40 : 85)) * 2, 100)));
  if (temperature !== null) scores.push(temperature >= 8 && temperature <= 25 ? 100 : Math.max(0, 100 - Math.min(Math.abs(temperature - (temperature < 8 ? 8 : 25)) * 5, 100)));
  if (ec !== null) scores.push(ec <= 1.5 ? 100 : Math.max(0, 100 - Math.min((ec - 1.5) * 50, 100)));
  return scores.length ? average(scores) : null;
}
function startOfWeek(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}
function formatLitres(value) {
  return value === null ? '—' : `${Math.round(value).toLocaleString('es-CO')} L`;
}

function TrendChart({ values }) {
  const width = 760, height = 250, pad = { top: 20, right: 20, bottom: 36, left: 38 };
  const points = values.map((value, index) => value === null ? null : {
    x: pad.left + index * ((width - pad.left - pad.right) / 6),
    y: pad.top + (100 - value) * ((height - pad.top - pad.bottom) / 100),
  });
  const path = points.reduce((segments, point) => {
    if (!point) return `${segments} `;
    const previous = segments.trimEnd();
    return `${previous}${previous && !previous.endsWith('M') ? ' ' : ''}${segments.endsWith(' ') || !previous ? 'M' : 'L'}${point.x},${point.y}`;
  }, '').trim();
  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return <div className="agri-trend-chart">
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tendencia semanal de estabilidad edafoclimática">
      {[0, 25, 50, 75, 100].map(tick => {
        const y = pad.top + (100 - tick) * ((height - pad.top - pad.bottom) / 100);
        return <g key={tick}><line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="agri-chart-grid"/><text x={pad.left - 9} y={y + 4} textAnchor="end" className="agri-chart-tick">{tick}</text></g>;
      })}
      {path && <path d={path} className="agri-chart-line"/>}
      {points.map((point, index) => point && <circle key={index} cx={point.x} cy={point.y} r="4.5" className="agri-chart-point"><title>{labels[index]}: {Math.round(values[index])}%</title></circle>)}
      {labels.map((label, index) => <text key={label} x={pad.left + index * ((width - pad.left - pad.right) / 6)} y={height - 8} textAnchor="middle" className="agri-chart-label">{label}</text>)}
      {!path && <text x={width / 2} y={height / 2} textAnchor="middle" className="agri-chart-empty">Aún no hay lecturas suficientes esta semana</text>}
    </svg>
  </div>;
}

export default function ReportesEstadisticas({ embedded = false }) {
  const [cultivos, setCultivos] = useState([]);
  const [lecturas, setLecturas] = useState([]);
  const [alerta, setAlerta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actualizado, setActualizado] = useState(null);

  const load = useCallback(async () => {
    try {
      const cropsResponse = await apiFetch('/cultivos');
      const cropsBody = await cropsResponse.json();
      if (!cropsResponse.ok) throw new Error(cropsBody.message || 'No se pudieron cargar los lotes.');
      const crops = Array.isArray(cropsBody) ? cropsBody : (cropsBody.cultivos || cropsBody.data || []);
      const now = new Date();
      const from = new Date(now.getTime() - 14 * DAY_MS).toISOString();
      const readingsByCrop = await Promise.all(crops.map(async crop => {
        try {
          const params = new URLSearchParams({ limit: '1000', desde: from });
          if (crop.device_id) params.set('device_id', crop.device_id);
          const response = await apiFetch(`/v1/cultivos/${encodeURIComponent(crop.id)}/telemetria?${params}`);
          if (!response.ok) return { crop, rows: [] };
          const body = await response.json();
          return { crop, rows: body.telemetria || [] };
        } catch { return { crop, rows: [] }; }
      }));
      let latestAlert = null;
      try {
        const response = await apiFetch('/alertas?estado=activa&limit=1');
        if (response.ok) latestAlert = (await response.json()).alertas?.[0] || null;
      } catch { /* El panel analítico sigue disponible aunque las alertas fallen. */ }
      setCultivos(crops);
      setLecturas(readingsByCrop);
      setAlerta(latestAlert);
      setActualizado(new Date());
      setError('');
    } catch (e) { setError(e.message || 'No se pudo actualizar el análisis.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const summary = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const previousStart = new Date(weekStart.getTime() - WEEK_MS);
    const cropLatest = lecturas.map(item => ({
      ...item,
      rows: [...item.rows].sort((a, b) => (observedAt(a)?.getTime() || 0) - (observedAt(b)?.getTime() || 0)),
      latest: [...item.rows].sort((a, b) => (observedAt(b)?.getTime() || 0) - (observedAt(a)?.getTime() || 0))[0] || null,
    }));
    const freshLatest = cropLatest.map(item => {
      const date = observedAt(item.latest);
      return date && now.getTime() - date.getTime() <= 10 * 60 * 1000 ? item.latest : null;
    });
    const latestPh = freshLatest.map(row => row ? numeric(row, aliases.ph) : null).filter(value => value !== null);
    const latestHumidity = freshLatest.map(row => row ? numeric(row, aliases.humedad) : null).filter(value => value !== null);
    const weekHumidity = cropLatest.flatMap(item => item.rows.filter(row => {
      const date = observedAt(row);
      return date && date >= weekStart && date <= now;
    }).map(row => numeric(row, aliases.humedad))).filter(value => value !== null);
    const priorHumidity = cropLatest.flatMap(item => item.rows.filter(row => {
      const date = observedAt(row);
      return date && date >= previousStart && date < weekStart;
    }).map(row => numeric(row, aliases.humedad))).filter(value => value !== null);
    const irrigation = cropLatest.flatMap(item => item.rows.filter(row => {
      const date = observedAt(row);
      return date && date >= weekStart && date <= now;
    }).map(row => numeric(row, aliases.riego))).filter(value => value !== null);
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const trend = labels.map((_, index) => {
      const day = new Date(weekStart.getTime() + index * DAY_MS);
      const nextDay = new Date(day.getTime() + DAY_MS);
      const scores = cropLatest.flatMap(item => item.rows.filter(row => {
        const date = observedAt(row);
        return date && date >= day && date < nextDay;
      }).map(stability)).filter(value => value !== null);
      return average(scores);
    });
    const lots = cropLatest.map(item => ({
      id: item.crop.id,
      name: item.crop.nombre || item.crop.name || `Lote ${item.crop.id}`,
      device: item.crop.device_id || item.crop.nodo || item.crop.nombre_nodo || '',
      score: item.latest && observedAt(item.latest) && now.getTime() - observedAt(item.latest).getTime() <= 10 * 60 * 1000 ? stability(item.latest) : null,
    }));
    return {
      activeCount: crops.length,
      ph: average(latestPh),
      moisture: average(latestHumidity),
      moistureDelta: average(weekHumidity) !== null && average(priorHumidity) !== null ? average(weekHumidity) - average(priorHumidity) : null,
      irrigation: irrigation.length ? irrigation.reduce((sum, value) => sum + value, 0) : null,
      trend, lots,
    };
  }, [cultivos, lecturas]);

  const kpis = [
    { title: 'Lotes activos', value: loading && !cultivos.length ? '…' : String(summary.activeCount), detail: 'En seguimiento', icon: Sprout, tone: 'green' },
    { title: 'pH promedio global', value: summary.ph === null ? '—' : summary.ph.toFixed(1), detail: summary.ph === null ? 'Sin telemetría de pH' : summary.ph >= 4.5 && summary.ph <= 5.5 ? 'Rango óptimo · 4.5–5.5' : 'Fuera del rango objetivo', icon: FlaskConical, tone: 'blue' },
    { title: 'Humedad del sustrato', value: summary.moisture === null ? '—' : `${summary.moisture.toFixed(1)}%`, detail: summary.moistureDelta === null ? 'Variación semanal sin datos previos' : `${summary.moistureDelta > 0 ? '+' : ''}${summary.moistureDelta.toFixed(1)}% vs. semana anterior`, icon: Droplets, tone: 'cyan' },
    { title: 'Riego acumulado', value: formatLitres(summary.irrigation), detail: 'Semana actual · lectura explícita', icon: Activity, tone: 'amber' },
  ];

  return <section className={`agri-reports ${embedded ? 'agri-reports-embedded' : ''}`}>
    <header className="agri-reports-header">
      <div><span className="agri-reports-eyebrow">Agricultura de precisión</span><h1>Análisis general de cultivos</h1><p>Indicadores y tendencias calculados a partir de las lecturas disponibles de tus nodos.</p></div>
      <button type="button" className="agri-reports-refresh" onClick={load} disabled={loading} aria-label="Actualizar análisis"><RefreshCw size={16} className={loading ? 'is-spinning' : ''}/><span>Actualizar</span></button>
    </header>
    {error && <div className="agri-reports-error" role="alert">{error}</div>}
    <div className="agri-kpi-grid">{kpis.map(({ title, value, detail, icon: Icon, tone }) => <article className="agri-kpi-card" key={title}><div className={`agri-kpi-icon ${tone}`}><Icon size={19}/></div><span className="agri-kpi-title">{title}</span><strong className="agri-kpi-value">{value}</strong><span className={`agri-kpi-detail ${title.startsWith('pH') && summary.ph !== null && (summary.ph < 4.5 || summary.ph > 5.5) ? 'is-warning' : ''}`}>{detail}</span></article>)}</div>
    <div className="agri-reports-main-grid">
      <article className="agri-panel agri-trend-panel"><div className="agri-panel-heading"><div><span className="agri-panel-kicker">Lecturas edafoclimáticas</span><h2>Estabilidad de los cultivos</h2><p>Promedio diario de las variables disponibles · semana en curso</p></div><span className="agri-live-tag"><i/>Actualización automática</span></div><TrendChart values={summary.trend}/><div className="agri-chart-footnote">El índice usa solo variables presentes en la telemetría (pH, humedad, temperatura y CE). Sin una lectura del día, no se interpola el dato.</div></article>
      <article className="agri-panel agri-lots-panel"><div className="agri-panel-heading"><div><span className="agri-panel-kicker">Monitoreo por lote</span><h2>Estabilidad actual</h2></div></div>{summary.lots.length ? <div className="agri-lot-list">{summary.lots.map(lot => <div className="agri-lot-item" key={lot.id}><div className="agri-lot-top"><div><strong>{lot.name}</strong>{lot.device && <span>{lot.device}</span>}</div><b className={lot.score === null ? 'is-missing' : ''}>{lot.score === null ? 'Sin dato' : `${Math.round(lot.score)}%`}</b></div><div className="agri-progress-track" role="progressbar" aria-label={`Estabilidad de ${lot.name}`} aria-valuenow={lot.score === null ? undefined : Math.round(lot.score)} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${lot.score ?? 0}%` }}/></div></div>)}</div> : <div className="agri-panel-empty">No hay lotes disponibles para esta cuenta.</div>}<p className="agri-lot-note">Los lotes sin lecturas recientes se muestran sin porcentaje.</p></article>
    </div>
    <aside className={`agri-system-notice ${alerta ? 'has-alert' : ''}`}><div className="agri-notice-icon">{alerta ? <TriangleAlert size={19}/> : <Activity size={19}/>}</div><div><strong>{alerta ? 'Alerta agronómica activa' : 'Estado del sistema'}</strong><p>{alerta ? `${alerta.mensaje || alerta.tipo}${alerta.recomendacion ? ` Acción sugerida: ${alerta.recomendacion}` : ''}` : 'No hay alertas agronómicas activas. Se mostrarán aquí cuando el backend registre una alerta.'}</p></div><span className="agri-notice-time">{actualizado ? `Actualizado ${actualizado.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}` : 'Conectando…'}</span></aside>
  </section>;
}
