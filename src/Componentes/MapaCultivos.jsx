import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import '../css componentes/Inicio.css';
import { apiFetch } from '../services/apiClient';
import './MapaCultivos.css';

const fincaLaGuaca = [5.309, -73.815];

const iconoEstado = (estado = '') => {
  const valor = estado.toLowerCase();
  const color = valor.includes('cosecha') ? 'yellow' : valor.includes('floración') ? 'orange' : valor.includes('problema') ? 'red' : 'green';
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  });
};

function AjustarMapa({ cultivos }) {
  const map = useMap();
  useEffect(() => {
    const points = cultivos.map(c => [Number(c.latitud), Number(c.longitud)]).filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
    if (points.length === 1) map.setView(points[0], 15);
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
    else map.setView(fincaLaGuaca, 13);
  }, [cultivos, map]);
  return null;
}

function EnfocarCultivo({ cultivo }) {
  const map = useMap();
  useEffect(() => {
    if (cultivo?.latitud != null && cultivo?.longitud != null) map.flyTo([Number(cultivo.latitud), Number(cultivo.longitud)], 16, { duration: 0.7 });
  }, [cultivo, map]);
  return null;
}

export default function MapaCultivos() {
  const navigate = useNavigate();
  const [cultivos, setCultivos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const userRole = JSON.parse(localStorage.getItem('usuario') || '{}').rol;

  useEffect(() => {
    let mounted = true;
    apiFetch('/cultivos/mapa').then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'No se pudieron cargar los cultivos del mapa.');
      if (mounted) setCultivos(data.cultivos || []);
    }).catch(e => mounted && setError(e.message)).finally(() => mounted && setCargando(false));
    return () => { mounted = false; };
  }, []);

  const geolocalizados = useMemo(() => cultivos.filter(c => Number.isFinite(Number(c.latitud)) && Number.isFinite(Number(c.longitud))), [cultivos]);

  return <section className="mapa-module">
    <header className="mapa-module-heading"><div><span className="mapa-kicker">AgrIoT · Finca La Guaca</span><h2>Mapa de cultivos</h2><p>Explora los lotes registrados y abre el monitoreo de cada nodo.</p></div><span className="mapa-count">{geolocalizados.length} ubicados</span></header>
    {error && <div className="mapa-alert" role="alert">{error}</div>}
    <div className="mapa-layout">
      <div className="mapa-canvas-wrap"><MapContainer center={fincaLaGuaca} zoom={13} scrollWheelZoom className="mapa-leaflet">
        <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AjustarMapa cultivos={geolocalizados} />
        <EnfocarCultivo cultivo={seleccionado} />
        {geolocalizados.map(cultivo => <Marker key={cultivo.id} position={[Number(cultivo.latitud), Number(cultivo.longitud)]} icon={iconoEstado(cultivo.estado_actual)} eventHandlers={{ click: () => setSeleccionado(cultivo) }}>
          <Tooltip direction="top" offset={[0, -35]} sticky><strong>{cultivo.nombre}</strong><br/>{cultivo.estado_actual}</Tooltip>
        </Marker>)}
      </MapContainer>
        {cargando && <div className="mapa-overlay">Cargando cultivos…</div>}
        {!cargando && !error && geolocalizados.length === 0 && <div className="mapa-overlay mapa-empty"><span>📍</span><strong>No hay cultivos geolocalizados</strong><small>Al crear un cultivo, selecciona una ubicación para marcarlo en el mapa.</small></div>}
      </div>
      <aside className="mapa-list-panel"><h3>Cultivos de la finca</h3>{cargando ? <p className="mapa-muted">Cargando…</p> : cultivos.length === 0 ? <p className="mapa-muted">No hay cultivos asignados para mostrar.</p> : cultivos.map(c => <button key={c.id} className={`mapa-list-item ${seleccionado?.id === c.id ? 'selected' : ''}`} onClick={() => setSeleccionado(c)}><span className="mapa-pin-dot"/><span><strong>{c.nombre}</strong><small>{c.estado_actual} · {c.usuario || 'Sin asignar'}</small></span><b>›</b></button>)}</aside>
      {seleccionado && <div className="mapa-drawer-backdrop" onClick={() => setSeleccionado(null)}><aside className="mapa-drawer" onClick={e => e.stopPropagation()}><button className="mapa-drawer-close" onClick={() => setSeleccionado(null)} aria-label="Cerrar">×</button><span className="mapa-kicker">Cultivo seleccionado</span><h3>{seleccionado.nombre}</h3><p className="mapa-drawer-variedad">{seleccionado.variedad || 'Arándano'}</p><dl><div><dt>Estado actual</dt><dd>{seleccionado.estado_actual || 'Sin estado'}</dd></div><div><dt>Usuario asignado</dt><dd>{seleccionado.usuario || 'Sin asignar'}</dd></div><div><dt>Nodo ESP32</dt><dd>{seleccionado.device_id || 'Sin nodo'}</dd></div><div><dt>Ubicación</dt><dd>{seleccionado.ubicacion || 'Sin ubicación'}</dd></div></dl><button className="mapa-monitor-button" onClick={() => navigate(`/cultivos/${seleccionado.id}`, { state: { from: userRole === 'user' ? '/mapa' : '/Inicio' } })}>Ver Monitoreo en Tiempo Real <span>→</span></button></aside></div>}
    </div>
  </section>;
}
