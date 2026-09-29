import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Beaker, Droplets, Download, Leaf, Sprout } from 'lucide-react';
import { apiFetch } from '../services/apiClient';
import '../css componentes/CalculadoraNutricional.css';

const ETAPAS = [
  ['vegetativo', 'Vegetativo'], ['floracion', 'Floración'],
  ['fructificacion', 'Fructificación'], ['cosecha', 'Cosecha'],
];
const INITIAL = {
  cultivo_id: '', etapa: 'vegetativo', ph: '', n: '', p: '', k: '', humedad_suelo: '', agua_litros: '',
  fertilizantes: { n_percent: '21', p2o5_percent: '52', k2o_percent: '50' }, acido_ml_litro_titulado: '',
};

const sensorValue = (crop, keys) => {
  const readings = crop?.lecturas || crop?.sensores || crop?.latest_readings || crop?.ultima_lectura || {};
  for (const key of keys) {
    const value = readings[key] ?? crop?.[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return '';
};
const format = (value, decimals = 2) => Number(value ?? 0).toLocaleString('es-CO', { maximumFractionDigits: decimals });

export default function CalculadoraNutricional({ embedded = false }) {
  const [cultivos, setCultivos] = useState([]);
  const [form, setForm] = useState(INITIAL);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    apiFetch('/cultivos').then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'No se pudieron cargar los cultivos.');
      if (active) {
        const rows = data.cultivos || [];
        setCultivos(rows);
        if (rows.length) setForm(current => ({ ...current, cultivo_id: String(rows[0].id) }));
      }
    }).catch(e => active && setError(e.message)).finally(() => active && setCargando(false));
    return () => { active = false; };
  }, []);

  const cultivoSeleccionado = useMemo(() => cultivos.find(c => String(c.id) === form.cultivo_id), [cultivos, form.cultivo_id]);
  useEffect(() => {
    if (!cultivoSeleccionado) return;
    setForm(current => ({
      ...current,
      ph: sensorValue(cultivoSeleccionado, ['ph', 'ph_suelo', 'ph_sustrato']),
      n: sensorValue(cultivoSeleccionado, ['n', 'nitrogeno', 'nitrogen', 'n_ppm']),
      p: sensorValue(cultivoSeleccionado, ['p', 'fosforo', 'phosphorus', 'p_ppm']),
      k: sensorValue(cultivoSeleccionado, ['k', 'potasio', 'potassium', 'k_ppm']),
      humedad_suelo: sensorValue(cultivoSeleccionado, ['humedad_suelo', 'humedad', 'soil_moisture']),
    }));
    setResultado(null);
  }, [cultivoSeleccionado]);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const updateGrade = (key, value) => setForm(current => ({ ...current, fertilizantes: { ...current.fertilizantes, [key]: value } }));

  async function calcular(event) {
    event.preventDefault(); setError(''); setResultado(null); setCalculando(true);
    try {
      const payload = {
        ...form,
        cultivo_id: Number(form.cultivo_id),
        ph: Number(form.ph), n: Number(form.n), p: Number(form.p), k: Number(form.k),
        humedad_suelo: form.humedad_suelo === '' ? null : Number(form.humedad_suelo),
        agua_litros: Number(form.agua_litros),
        fertilizantes: Object.fromEntries(Object.entries(form.fertilizantes).map(([key, value]) => [key, Number(value)])),
        acido_ml_litro_titulado: form.acido_ml_litro_titulado === '' ? null : Number(form.acido_ml_litro_titulado),
      };
      const response = await apiFetch('/calculadora-nutricional', { method: 'POST', body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.detail || Object.values(data.errors || {}).flat().join(' ') || 'No se pudo calcular la dosis.');
      setResultado(data);
    } catch (e) { setError(e.message || 'Error de conexión al calcular la dosis.'); }
    finally { setCalculando(false); }
  }

  function exportarCsv() {
    if (!resultado) return;
    const rows = [
      ['AgrIoT - Calculadora Nutricional'], ['Cultivo', resultado.cultivo.nombre], ['Nodo', resultado.cultivo.device_id || 'Sin nodo'],
      ['Etapa', resultado.etapa], ['pH actual', resultado.ph.actual], ['Estado pH', resultado.ph.estado],
      ['N actual (mg/L)', resultado.nutrientes.n.actual_mg_l], ['N fertilizante (g)', resultado.dosis.n_g],
      ['P actual (mg/L)', resultado.nutrientes.p.actual_mg_l], ['P fertilizante equivalente (g)', resultado.dosis.p_g],
      ['K actual (mg/L)', resultado.nutrientes.k.actual_mg_l], ['K fertilizante equivalente (g)', resultado.dosis.k_g],
      ['Agua (L)', resultado.agua_litros], ['Corrector ácido (mL)', resultado.ph.corrector?.cantidad_ml ?? 'Requiere titulación'],
      ['Humedad suelo (%)', resultado.humedad_suelo?.actual_porcentaje ?? 'Sin lectura'],
      ['Aviso', resultado.aviso_agronomico],
    ];
    const csv = rows.map(row => row.map(cell => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `agriot-dosis-${resultado.cultivo.id}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  const statusLabel = value => ({ optimo: 'Óptimo', deficiente: 'Deficiente', excesivo: 'Excesivo', bajo: 'Bajo', alto: 'Alto', baja: 'Baja', excesiva: 'Excesiva', alta: 'Alta' }[value] || value);
  return <section className={`nutri-page ${embedded ? 'nutri-embedded' : ''}`}>
    <header className="nutri-heading"><div className="nutri-heading-icon"><Sprout size={23} /></div><div><span className="nutri-eyebrow">Agronomía de precisión · Arándano</span><h1>Calculadora nutricional</h1><p>Estima dosis de fertirriego según etapa, lecturas y volumen de agua.</p></div></header>
    <div className="nutri-layout">
      <form className="nutri-panel nutri-form" onSubmit={calcular}>
        <div className="nutri-panel-title"><span className="nutri-step">01</span><div><h2>Datos del lote</h2><p>Registra las lecturas actuales del sustrato o del agua.</p></div></div>
        <label className="nutri-field"><span>Cultivo asignado</span><select required value={form.cultivo_id} onChange={e => update('cultivo_id', e.target.value)} disabled={cargando || !cultivos.length}><option value="">{cargando ? 'Cargando cultivos…' : 'Selecciona un cultivo'}</option>{cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre} · {c.device_id || 'Sin nodo'}</option>)}</select></label>
        {!cargando && !cultivos.length && <p className="nutri-inline-note">No hay cultivos asignados disponibles para tu cuenta.</p>}
        <div className="nutri-field-grid"><label className="nutri-field"><span>Etapa fenológica</span><select value={form.etapa} onChange={e => update('etapa', e.target.value)}>{ETAPAS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="nutri-field"><span>Agua de riego (L)</span><input required type="number" min="0.1" step="any" placeholder="Ej. 500" value={form.agua_litros} onChange={e => update('agua_litros', e.target.value)} /></label></div>
        <div className="nutri-section-label"><Activity size={17}/><span>Lecturas del cultivo</span><small>{cultivoSeleccionado?.device_id ? `Nodo ${cultivoSeleccionado.device_id}` : 'Ingreso manual'}</small></div>
        <div className="nutri-field-grid nutri-three"><label className="nutri-field"><span>pH actual</span><div className="nutri-input-unit"><input required type="number" min="0" max="14" step="any" placeholder="5.2" value={form.ph} onChange={e => update('ph', e.target.value)}/><b>pH</b></div></label><label className="nutri-field"><span>Nitrógeno (N)</span><div className="nutri-input-unit"><input required type="number" min="0" step="any" placeholder="mg/L" value={form.n} onChange={e => update('n', e.target.value)}/><b>mg/L</b></div></label><label className="nutri-field"><span>Fósforo (P)</span><div className="nutri-input-unit"><input required type="number" min="0" step="any" placeholder="mg/L" value={form.p} onChange={e => update('p', e.target.value)}/><b>mg/L</b></div></label><label className="nutri-field"><span>Potasio (K)</span><div className="nutri-input-unit"><input required type="number" min="0" step="any" placeholder="mg/L" value={form.k} onChange={e => update('k', e.target.value)}/><b>mg/L</b></div></label><label className="nutri-field"><span>Humedad del suelo</span><div className="nutri-input-unit"><input type="number" min="0" max="100" step="any" placeholder="Opcional" value={form.humedad_suelo} onChange={e => update('humedad_suelo', e.target.value)}/><b>%</b></div></label></div>
        <details className="nutri-advanced"><summary>Análisis de etiqueta y calibración del ácido</summary><p>Usa el porcentaje indicado en cada producto. El ácido requiere una prueba de titulación con el agua real de riego.</p><div className="nutri-field-grid nutri-three"><label className="nutri-field"><span>Producto fuente de N (%)</span><input type="number" min="0.01" max="100" step="any" required value={form.fertilizantes.n_percent} onChange={e => updateGrade('n_percent', e.target.value)}/></label><label className="nutri-field"><span>Producto fuente de P₂O₅ (%)</span><input type="number" min="0.01" max="100" step="any" required value={form.fertilizantes.p2o5_percent} onChange={e => updateGrade('p2o5_percent', e.target.value)}/></label><label className="nutri-field"><span>Producto fuente de K₂O (%)</span><input type="number" min="0.01" max="100" step="any" required value={form.fertilizantes.k2o_percent} onChange={e => updateGrade('k2o_percent', e.target.value)}/></label><label className="nutri-field nutri-acid-field"><span>Ácido titulado (mL/L)</span><input type="number" min="0" step="any" placeholder="Opcional, según prueba" value={form.acido_ml_litro_titulado} onChange={e => update('acido_ml_litro_titulado', e.target.value)}/></label></div></details>
        <button type="submit" className="nutri-submit" disabled={calculando || !cultivos.length}><Beaker size={18}/>{calculando ? 'Calculando dosis…' : 'Calcular dosis de fertirriego'}</button>
        {error && <p className="nutri-error" role="alert">{error}</p>}
      </form>

      <section className="nutri-results" aria-live="polite">
        {!resultado ? <div className="nutri-empty"><div><Leaf size={28}/></div><h2>Diagnóstico del lote</h2><p>Completa las lecturas y calcula para consultar el estado nutricional y la recomendación de dosis.</p><div className="nutri-range"><span>Rango de pH objetivo</span><strong>4.5 – 5.5</strong></div></div> : <>
          <div className="nutri-result-heading"><div><span className="nutri-eyebrow">Resultado · {resultado.etapa}</span><h2>{resultado.cultivo.nombre}</h2><p>Nodo {resultado.cultivo.device_id || 'sin identificar'} · {format(resultado.agua_litros, 0)} L de riego</p></div><button type="button" className="nutri-export" onClick={exportarCsv}><Download size={17}/> Exportar CSV</button></div>
          <div className="nutri-diagnosis-grid"><article className={`nutri-diagnosis status-${resultado.ph.estado}`}><span>pH del sustrato</span><strong>{format(resultado.ph.actual, 1)}</strong><em>{statusLabel(resultado.ph.estado)}</em><small>Objetivo 4.5–5.5</small></article>{[['n','Nitrógeno'],['p','Fósforo'],['k','Potasio']].map(([key,label]) => <article key={key} className={`nutri-diagnosis status-${resultado.nutrientes[key].estado}`}><span>{label} ({key.toUpperCase()})</span><strong>{format(resultado.nutrientes[key].actual_mg_l, 1)} <small>mg/L</small></strong><em>{statusLabel(resultado.nutrientes[key].estado)}</em><small>Objetivo {format(resultado.nutrientes[key].objetivo_mg_l, 1)} mg/L</small></article>)}{resultado.humedad_suelo && <article className={`nutri-diagnosis status-${resultado.humedad_suelo.estado === 'optima' ? 'optimo' : 'deficiente'}`}><span>Humedad del suelo</span><strong>{format(resultado.humedad_suelo.actual_porcentaje, 1)}%</strong><em>{statusLabel(resultado.humedad_suelo.estado)}</em><small>Lectura reportada</small></article>}</div>
          <div className="nutri-dose-card"><div className="nutri-dose-title"><Droplets size={19}/><div><h3>Dosis variable estimada</h3><p>Equivalentes por producto según concentración declarada</p></div></div><div className="nutri-dose-grid"><div><span>Fuente de N</span><strong>{format(resultado.dosis.n_g)} <small>g</small></strong></div><div><span>Fuente de P</span><strong>{format(resultado.dosis.p_g)} <small>g</small></strong></div><div><span>Fuente de K</span><strong>{format(resultado.dosis.k_g)} <small>g</small></strong></div><div><span>Corrector de pH</span><strong>{resultado.ph.corrector ? `${format(resultado.ph.corrector.cantidad_ml)} ml` : '—'}</strong></div></div>{resultado.ph.requiere_titulacion && <p className="nutri-warning"><AlertTriangle size={16}/> El pH está alto. Ingresa el resultado de una titulación para estimar la cantidad de ácido.</p>}<p className="nutri-caveat">{resultado.dosis.nota}</p></div>
          {resultado.alertas.length > 0 && <div className="nutri-alerts"><h3><AlertTriangle size={17}/> Revisión requerida</h3>{resultado.alertas.map((alert, i) => <p key={i}>{alert}</p>)}</div>}
          <p className="nutri-agronomic-note">{resultado.aviso_agronomico}</p>
        </>}
      </section>
    </div>
    {!embedded && <button className="nutri-back" onClick={() => navigate(-1)}>Volver al panel</button>}
  </section>;
}
