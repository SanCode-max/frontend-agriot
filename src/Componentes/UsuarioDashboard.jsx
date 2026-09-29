import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import './UsuarioDashboard.css';
import './CultivoMonitoreo.css';

export default function UsuarioDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;
    apiFetch('/usuario/dashboard').then(async response => {
      const data = await response.json();
      if (response.status === 403 && data.must_change_password) { navigate('/cambiar-password', { replace: true }); return; }
      if (!response.ok) throw new Error(data.detail || 'No se pudo cargar tu dashboard.');
      if (activo) setDashboard(data);
    }).catch(e => activo && setError(e.message)).finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, [navigate]);

  async function cerrarSesion() {
    try { await apiFetch('/logout', { method: 'POST' }); } catch (_) { /* La sesión local se limpia aunque el servidor no responda. */ }
    localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/login', { replace: true });
  }

  const usuario = dashboard?.usuario || JSON.parse(localStorage.getItem('usuario') || '{}');
  const cultivos = dashboard?.cultivos || [];
  return <main className="agriot-dashboard"><header className="agriot-topbar"><a className="agriot-brand" href="/">Agr<span>IoT</span></a><div className="agriot-top-actions"><button className="agriot-button agriot-button-light" onClick={() => navigate('/mapa')}>Mapa de cultivos</button><button className="agriot-button agriot-button-light" onClick={cerrarSesion}>Cerrar sesión</button></div></header>
    <section className="agriot-welcome"><span className="agriot-eyebrow">Panel de operación</span><h1>Hola, {usuario.nombre || 'agricultor'} 👋</h1><p>Este es el estado de tus cultivos asignados.</p></section>
    {error && <p className="agriot-error" role="alert">{error}</p>}
    <section className="agriot-stats"><article><span>Cultivos asignados</span><strong>{cargando ? '…' : dashboard?.resumen?.total_cultivos ?? cultivos.length}</strong></article><article><span>Estado de cuenta</span><strong className="agriot-status">Activa</strong></article><article><span>Monitoreo</span><strong>En línea</strong></article></section>
    <section className="agriot-crops"><div className="agriot-section-heading"><div><span className="agriot-eyebrow">Seguimiento</span><h2>Mis cultivos asignados</h2></div><span className="agriot-count">{cultivos.length} registros</span></div>
      {cargando ? <p className="agriot-empty">Cargando tus cultivos…</p> : cultivos.length === 0 ? <div className="agriot-empty"><span>🌱</span><h3>Aún no tienes cultivos asignados</h3><p>Cuando el administrador te asigne cultivos, aparecerán aquí.</p></div> : <div className="agriot-crop-grid">{cultivos.map(c => <button type="button" className="agriot-crop-card agriot-crop-card-button" key={c.id} onClick={() => navigate(`/cultivos/${c.id}`)}><span className="agriot-crop-icon">🌿</span><div><h3>{c.nombre || c.name || `Cultivo #${c.id}`}</h3><p>{c.ubicacion || c.location || 'Ubicación no especificada'}</p><small>Nodo {c.device_id || 'pendiente'}</small></div><span className="agriot-pill">{c.estado || c.status || 'En seguimiento'}</span></button>)}</div>}
    </section>
  </main>;
}
