import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import './CultivoMonitoreo.css';

const pH = 5.2;
const humedad = 68.5;
const tanque = 72;

export default function CultivoMonitoreo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [cultivo, setCultivo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    apiFetch(`/cultivos/${id}`).then(async response => {
      const data = await response.json();
      if (response.status === 403 && data.must_change_password) { navigate('/cambiar-password', { replace: true }); return; }
      if (response.status === 401) { navigate('/login', { replace: true }); return; }
      if (!response.ok) throw new Error(response.status === 404 ? 'No tienes acceso a este cultivo o ya no existe.' : (data.detail || 'No se pudo cargar el cultivo.'));
      if (mounted) setCultivo(data.cultivo);
    }).catch(e => mounted && setError(e.message));
    return () => { mounted = false; };
  }, [id, navigate]);

  const user = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (error) return <main className="monitor-page"><button className="monitor-back" onClick={() => navigate(-1)}>← Volver</button><section className="monitor-error"><h1>Cultivo no disponible</h1><p>{error}</p></section></main>;
  if (!cultivo) return <main className="monitor-page"><div className="monitor-loading">Cargando datos del cultivo…</div></main>;

  return <main className="monitor-page">
    <header className="monitor-topbar"><button className="monitor-back" onClick={() => navigate(location.state?.from || (user.rol === 'user' ? '/dashboard/usuario' : '/Inicio'))}>← Mis cultivos</button><span className="monitor-brand">Agr<span>IoT</span></span><span className="monitor-live"><i/>Gateway conectado</span></header>
    <section className="monitor-heading"><div><span className="monitor-eyebrow">Sub-dashboard de monitoreo</span><h1>{cultivo.nombre}</h1><p>{cultivo.ubicacion} · Nodo <b>{cultivo.device_id}</b></p></div><span className="monitor-state">{cultivo.estado_actual}</span></section>
    <section className="monitor-camera panel"><div className="panel-title"><div><span className="monitor-eyebrow">Visión del cultivo</span><h2>ESP32-CAM</h2></div><span className="camera-live"><i/>Vista simulada</span></div><div className="camera-scene"><div className="camera-sun"/><div className="camera-hill camera-hill-back"/><div className="camera-hill camera-hill-front"/><div className="camera-rows">{Array.from({length: 6}, (_, i) => <span key={i}/>)}</div><div className="camera-overlay">TRANSMISIÓN SIMULADA · {cultivo.device_id}</div></div><div className="camera-meta"><span>Resolución<strong>1280 × 720</strong></span><span>Frecuencia<strong>15 FPS</strong></span><span>Panel solar<strong className="solar-ok">● Cargando</strong></span></div></section>
    <section className="monitor-metrics">
      <article className="panel metric-card"><div className="panel-title"><div><span className="monitor-eyebrow">Sustrato / solución</span><h2>pH actual</h2></div><span className="metric-icon">◉</span></div><div className="ph-meter" style={{'--ph-angle': `${((pH - 0) / 14) * 100}%`}}><div><strong>{pH.toFixed(1)}</strong><span>pH</span></div></div><p className="metric-note"><b>Rango objetivo:</b> 4.8 – 5.5 pH</p><div className="metric-scale"><span>Ácido</span><span>Óptimo</span><span>Alcalino</span></div></article>
      <article className="panel metric-card"><div className="panel-title"><div><span className="monitor-eyebrow">Temperatura edafoclimática</span><h2>Bulbo radicular</h2></div><span className="metric-icon warm">☀</span></div><div className="temperature-reading"><strong>18.7</strong><span>°C</span><small>En rango óptimo</small></div><svg className="thermal-chart" viewBox="0 0 360 112" role="img" aria-label="Curva térmica diaria simulada"><defs><linearGradient id="thermalFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f59e0b" stopOpacity=".3"/><stop offset="1" stopColor="#f59e0b" stopOpacity="0"/></linearGradient></defs><path d="M0 82 C35 75 42 45 78 51 S123 79 155 55 S208 30 235 43 S286 72 310 37 S341 25 360 18 V112 H0Z" fill="url(#thermalFill)"/><path d="M0 82 C35 75 42 45 78 51 S123 79 155 55 S208 30 235 43 S286 72 310 37 S341 25 360 18" fill="none" stroke="#e99431" strokeWidth="3" strokeLinecap="round"/></svg><div className="chart-axis"><span>06:00</span><span>10:00</span><span>14:00</span><span>18:00</span></div></article>
      <article className="panel metric-card"><div className="panel-title"><div><span className="monitor-eyebrow">Agua disponible</span><h2>Humedad del suelo</h2></div><span className="metric-icon blue">≈</span></div><div className="vwc-reading"><strong>{humedad}</strong><span>% VWC</span></div><div className="vwc-track"><span style={{width: `${humedad}%`}}/></div><div className="vwc-markers"><span><i className="field-capacity"/>Capacidad de campo <b>60%</b></span><span><i className="drainage"/>Drenaje <b>85%</b></span></div><p className="metric-note">Humedad adecuada para el desarrollo radicular.</p></article>
    </section>
    <section className="panel tank-panel"><div className="panel-title"><div><span className="monitor-eyebrow">Sistema central de fertirriego</span><h2>Tanque de reserva</h2></div><span className="tank-autonomy">Autonomía estimada<strong>4.8 días</strong></span></div><div className="tank-content"><div className="tank-visual"><div className="tank-shell"><div className="tank-water" style={{height: `${tanque}%`}}/><div className="tank-percent">{tanque}%</div></div><div className="tank-capacity"><strong>7,200 L</strong><span>de 10,000 L</span></div></div><div className="tank-statuses"><div><span>Electroválvula</span><strong className="status-online"><i/>Abierta</strong></div><div><span>Bomba principal</span><strong className="status-online"><i/>Operativa</strong></div><div><span>Última actualización</span><strong>Hace 30 segundos</strong></div></div></div></section>
    <p className="simulation-note">Las lecturas de sensores y cámara son simuladas mientras se integra el nodo físico.</p>
  </main>;
}
