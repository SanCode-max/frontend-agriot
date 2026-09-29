import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, buildMediaUrl } from '../services/apiClient';
import PerfilUsuario from './PerfilUsuario';
import { FaBell } from 'react-icons/fa';
import '../css componentes/UsuarioDashboard.css';
import '../css componentes/CultivoMonitoreo.css';

export default function UsuarioDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState('');
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
  useEffect(() => {
    if (!usuario.correo) return;
    let activo = true;
    apiFetch(`/perfil/${encodeURIComponent(usuario.correo)}`).then(response => response.ok ? response.json() : null)
      .then(data => { if (activo && data?.foto) setFotoPerfil(data.foto); }).catch(() => {});
    return () => { activo = false; };
  }, [usuario.correo]);
  useEffect(() => {
    if (!perfilAbierto) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = event => { if (event.key === 'Escape') setPerfilAbierto(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape); };
  }, [perfilAbierto]);
  return <main className="agriot-dashboard"><header className="agriot-topbar"><a className="agriot-brand" href="/">Agr<span>IoT</span></a><div className="agriot-top-actions"><button className="agriot-button agriot-button-light" onClick={() => navigate('/mapa')}>Mapa de cultivos</button><button className="agriot-button agriot-button-light" onClick={() => navigate('/calculadora-nutricional')}>Calculadora nutricional</button><button type="button" className="agriot-notification-button" aria-label="Notificaciones"><FaBell /></button><button type="button" className="agriot-profile-avatar" onClick={() => setPerfilAbierto(true)} aria-label="Abrir perfil" title="Mi perfil"><img src={fotoPerfil ? buildMediaUrl(fotoPerfil, Date.now()) : '/profile-icon.png'} alt=""/></button><button className="agriot-button agriot-button-light" onClick={cerrarSesion}>Cerrar sesión</button></div></header>
    <section className="agriot-welcome"><span className="agriot-eyebrow">Panel de operación</span><h1>Hola, {usuario.nombre || 'agricultor'} 👋</h1><p>Este es el estado de tus cultivos asignados.</p></section>
    {error && <p className="agriot-error" role="alert">{error}</p>}
    <section className="agriot-stats"><article><span>Cultivos asignados</span><strong>{cargando ? '…' : dashboard?.resumen?.total_cultivos ?? cultivos.length}</strong></article><article><span>Estado de cuenta</span><strong className="agriot-status">Activa</strong></article><article><span>Monitoreo</span><strong>En línea</strong></article></section>
    <section className="agriot-crops"><div className="agriot-section-heading"><div><span className="agriot-eyebrow">Seguimiento</span><h2>Mis cultivos asignados</h2></div><span className="agriot-count">{cultivos.length} registros</span></div>
      {cargando ? <p className="agriot-empty">Cargando tus cultivos…</p> : cultivos.length === 0 ? <div className="agriot-empty"><span>🌱</span><h3>Aún no tienes cultivos asignados</h3><p>Cuando el administrador te asigne cultivos, aparecerán aquí.</p></div> : <div className="agriot-crop-grid">{cultivos.map(c => <button type="button" className="agriot-crop-card agriot-crop-card-button" key={c.id} onClick={() => navigate(`/cultivos/${c.id}`)}><span className="agriot-crop-icon">🌿</span><div><h3>{c.nombre || c.name || `Cultivo #${c.id}`}</h3><p>{c.ubicacion || c.location || 'Ubicación no especificada'}</p><small>Nodo {c.device_id || 'pendiente'}</small></div><span className="agriot-pill">{c.estado || c.status || 'En seguimiento'}</span></button>)}</div>}
    </section>
    {perfilAbierto && <div className="profile-card-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPerfilAbierto(false); }}><section className="profile-card-dialog" role="dialog" aria-modal="true" aria-label="Perfil del usuario"><button type="button" className="profile-card-close" onClick={() => setPerfilAbierto(false)} aria-label="Cerrar perfil">×</button><PerfilUsuario onProfileUpdated={setFotoPerfil} /></section></div>}
  </main>;
}
