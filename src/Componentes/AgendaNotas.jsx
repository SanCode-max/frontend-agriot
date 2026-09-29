import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarDays, Check, Clock3, Edit3, FileText, Plus, Save, Trash2, X } from 'lucide-react';
import { apiFetch } from '../services/apiClient';
import '../css componentes/AgendaNotas.css';

const EVENT_INITIAL = { titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', tipo: 'riego' };
const NOTE_INITIAL = { titulo: '', contenido: '', fecha_asociada: '' };
const EVENT_TYPES = [
  ['riego', 'Riego'], ['fertilizacion', 'Fertilización'], ['mantenimiento', 'Mantenimiento'],
  ['visita', 'Visita a la finca'], ['cosecha', 'Cosecha'], ['general', 'General'],
];

function localInputValue(date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}
function sqlLocalDateTime(value) { return value ? `${value.replace('T', ' ')}:00` : null; }
function toInputDateTime(value) {
  if (!value) return '';
  return String(value).replace(' ', 'T').slice(0, 16);
}
async function responseData(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.detail || Object.values(data.errors || {}).flat().join(' ') || 'No se pudo completar la solicitud.');
  return data;
}

export default function AgendaNotas({ embedded = false }) {
  const [eventos, setEventos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [eventoModal, setEventoModal] = useState(false);
  const [eventoId, setEventoId] = useState(null);
  const [eventoForm, setEventoForm] = useState(EVENT_INITIAL);
  const [notaForm, setNotaForm] = useState(NOTE_INITIAL);
  const [notaEditando, setNotaEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargarAgenda = useCallback(async () => {
    setCargando(true);
    try {
      const [eventsResponse, notesResponse] = await Promise.all([apiFetch('/agenda/eventos'), apiFetch('/agenda/notas')]);
      const [eventsData, notesData] = await Promise.all([responseData(eventsResponse), responseData(notesResponse)]);
      setEventos(eventsData.eventos || []);
      setNotas(notesData.notas || []);
      setError('');
    } catch (e) { setError(e.message || 'No se pudo cargar tu agenda.'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarAgenda(); }, [cargarAgenda]);

  const fullCalendarEvents = useMemo(() => eventos.map(evento => ({
    id: String(evento.id), title: evento.titulo, start: evento.fecha_inicio, end: evento.fecha_fin || undefined,
    extendedProps: { tipo: evento.tipo, descripcion: evento.descripcion || '' },
    classNames: [`agenda-event-${evento.tipo || 'general'}`],
  })), [eventos]);

  const abrirEventoNuevo = (date) => {
    const start = new Date(date);
    if (date.length <= 10) start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setEventoId(null);
    setEventoForm({ ...EVENT_INITIAL, fecha_inicio: localInputValue(start), fecha_fin: localInputValue(end) });
    setError(''); setEventoModal(true);
  };

  const abrirEventoEditar = (calendarEvent) => {
    const evento = eventos.find(item => String(item.id) === calendarEvent.id);
    if (!evento) return;
    setEventoId(evento.id);
    setEventoForm({
      titulo: evento.titulo || '', descripcion: evento.descripcion || '', tipo: evento.tipo || 'general',
      fecha_inicio: toInputDateTime(evento.fecha_inicio), fecha_fin: toInputDateTime(evento.fecha_fin),
    });
    setError(''); setEventoModal(true);
  };

  async function guardarEvento(e) {
    e.preventDefault(); setGuardando(true); setError('');
    try {
      const payload = { ...eventoForm, fecha_inicio: sqlLocalDateTime(eventoForm.fecha_inicio), fecha_fin: sqlLocalDateTime(eventoForm.fecha_fin) };
      const response = await apiFetch(eventoId ? `/agenda/eventos/${eventoId}` : '/agenda/eventos', { method: eventoId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      await responseData(response);
      setEventoModal(false); setMensaje(eventoId ? 'Evento actualizado.' : 'Evento agregado al calendario.');
      await cargarAgenda();
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  }

  async function eliminarEvento() {
    if (!eventoId || !window.confirm('¿Eliminar este evento del calendario?')) return;
    setGuardando(true); setError('');
    try {
      await responseData(await apiFetch(`/agenda/eventos/${eventoId}`, { method: 'DELETE' }));
      setEventoModal(false); setMensaje('Evento eliminado.'); await cargarAgenda();
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  }

  async function guardarNota(e) {
    e.preventDefault(); setGuardando(true); setError('');
    try {
      const payload = { ...notaForm, fecha_asociada: notaForm.fecha_asociada || null, completada: Boolean(notaEditando?.completada) };
      const response = await apiFetch(notaEditando ? `/agenda/notas/${notaEditando.id}` : '/agenda/notas', { method: notaEditando ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      await responseData(response);
      setNotaForm(NOTE_INITIAL); setNotaEditando(null); setMensaje(notaEditando ? 'Nota actualizada.' : 'Nota guardada.'); await cargarAgenda();
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  }

  async function actualizarNota(nota, changes) {
    setError('');
    try {
      const payload = { titulo: nota.titulo, contenido: nota.contenido, fecha_asociada: nota.fecha_asociada || null, completada: changes.completada ?? nota.completada };
      await responseData(await apiFetch(`/agenda/notas/${nota.id}`, { method: 'PUT', body: JSON.stringify(payload) }));
      setNotas(current => current.map(item => item.id === nota.id ? { ...item, ...changes } : item));
    } catch (e) { setError(e.message); }
  }

  async function eliminarNota(nota) {
    if (!window.confirm(`¿Eliminar la nota “${nota.titulo}”?`)) return;
    try {
      await responseData(await apiFetch(`/agenda/notas/${nota.id}`, { method: 'DELETE' }));
      setNotas(current => current.filter(item => item.id !== nota.id)); setMensaje('Nota eliminada.');
      if (notaEditando?.id === nota.id) { setNotaEditando(null); setNotaForm(NOTE_INITIAL); }
    } catch (e) { setError(e.message); }
  }

  function editarNota(nota) {
    setNotaEditando(nota);
    setNotaForm({ titulo: nota.titulo, contenido: nota.contenido, fecha_asociada: nota.fecha_asociada || '' });
    setError('');
  }

  return <main className={`agenda-page ${embedded ? 'agenda-embedded' : ''}`}>
    <header className="agenda-heading"><div className="agenda-heading-icon"><CalendarDays size={24}/></div><div><span className="agenda-eyebrow">AgrIoT · Organización de finca</span><h1>Calendario y notas</h1><p>Programa las labores del cultivo y conserva tus apuntes en un solo lugar.</p></div><button className="agenda-add-event" type="button" onClick={() => abrirEventoNuevo(new Date())}><Plus size={18}/> Nuevo evento</button></header>
    {error && !eventoModal && <div className="agenda-alert" role="alert">{error}</div>}
    {mensaje && <div className="agenda-toast" role="status">{mensaje}<button onClick={() => setMensaje('')} aria-label="Cerrar aviso"><X size={15}/></button></div>}
    <div className="agenda-workspace">
      <section className="agenda-calendar-card"><div className="agenda-card-heading"><div><h2>Agenda de labores</h2><p>Selecciona una fecha para registrar una actividad.</p></div><span className="agenda-owner-label">Tu agenda personal</span></div>
        {cargando ? <div className="agenda-loading">Cargando calendario y notas…</div> : <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} locale={esLocale} initialView="dayGridMonth" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }} buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }} events={fullCalendarEvents} dateClick={info => abrirEventoNuevo(info.dateStr)} eventClick={info => abrirEventoEditar(info.event)} height="auto" dayMaxEvents eventDisplay="block" nowIndicator weekends firstDay={1} noEventsText="No hay eventos programados"/>}
      </section>
      <aside className="agenda-notes-card"><div className="agenda-card-heading agenda-notes-heading"><div className="agenda-notes-icon"><FileText size={19}/></div><div><h2>Block de notas</h2><p>Ideas y pendientes de campo.</p></div><span className="agenda-note-count">{notas.length}</span></div>
        <form className="agenda-note-form" onSubmit={guardarNota}><div className="agenda-note-form-title"><strong>{notaEditando ? 'Editar apunte' : 'Nota rápida'}</strong>{notaEditando && <button type="button" onClick={() => { setNotaEditando(null); setNotaForm(NOTE_INITIAL); }} aria-label="Cancelar edición"><X size={16}/></button>}</div><input required maxLength="160" placeholder="Título de la nota" value={notaForm.titulo} onChange={e => setNotaForm({ ...notaForm, titulo: e.target.value })}/><textarea required maxLength="10000" rows="3" placeholder="Escribe un apunte o pendiente…" value={notaForm.contenido} onChange={e => setNotaForm({ ...notaForm, contenido: e.target.value })}/><label className="agenda-note-date"><span>Asociar a una fecha (opcional)</span><input type="date" value={notaForm.fecha_asociada} onChange={e => setNotaForm({ ...notaForm, fecha_asociada: e.target.value })}/></label><button className="agenda-save-note" type="submit" disabled={guardando}><Save size={16}/>{guardando ? 'Guardando…' : notaEditando ? 'Guardar cambios' : 'Guardar nota'}</button></form>
        <div className="agenda-notes-list">{notas.length === 0 ? <div className="agenda-notes-empty"><FileText size={22}/><span>Tus notas guardadas aparecerán aquí.</span></div> : notas.map(nota => <article className={`agenda-note ${nota.completada ? 'is-completed' : ''}`} key={nota.id}><div className="agenda-note-top"><button type="button" className="agenda-note-check" onClick={() => actualizarNota(nota, { completada: !nota.completada })} aria-label={nota.completada ? 'Marcar pendiente' : 'Marcar completada'}>{nota.completada && <Check size={13}/>}</button><h3>{nota.titulo}</h3><div className="agenda-note-actions"><button type="button" onClick={() => editarNota(nota)} aria-label="Editar nota"><Edit3 size={14}/></button><button type="button" onClick={() => eliminarNota(nota)} aria-label="Eliminar nota"><Trash2 size={14}/></button></div></div><p>{nota.contenido}</p>{nota.fecha_asociada && <span className="agenda-note-associated"><Clock3 size={12}/>{new Date(`${nota.fecha_asociada}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>}</article>)}</div>
      </aside>
    </div>
    {eventoModal && <div className="agenda-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget && !guardando) setEventoModal(false); }}><section className="agenda-event-modal" role="dialog" aria-modal="true" aria-labelledby="agenda-event-title"><header><div><span className="agenda-eyebrow">Agenda de labores</span><h2 id="agenda-event-title">{eventoId ? 'Editar evento' : 'Nuevo evento'}</h2></div><button type="button" onClick={() => setEventoModal(false)} disabled={guardando} aria-label="Cerrar"><X size={19}/></button></header><form onSubmit={guardarEvento}><label>Título<input required maxLength="160" autoFocus value={eventoForm.titulo} onChange={e => setEventoForm({ ...eventoForm, titulo: e.target.value })} placeholder="Ej. Riego sector norte"/></label><label>Tipo de actividad<select value={eventoForm.tipo} onChange={e => setEventoForm({ ...eventoForm, tipo: e.target.value })}>{EVENT_TYPES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="agenda-event-dates"><label>Inicio<input required type="datetime-local" value={eventoForm.fecha_inicio} onChange={e => setEventoForm({ ...eventoForm, fecha_inicio: e.target.value })}/></label><label>Fin<input type="datetime-local" min={eventoForm.fecha_inicio} value={eventoForm.fecha_fin} onChange={e => setEventoForm({ ...eventoForm, fecha_fin: e.target.value })}/></label></div><label>Descripción<textarea rows="3" maxLength="5000" value={eventoForm.descripcion} onChange={e => setEventoForm({ ...eventoForm, descripcion: e.target.value })} placeholder="Detalles de la actividad…"/></label>{error && <p className="agenda-alert" role="alert">{error}</p>}<footer>{eventoId && <button className="agenda-delete-event" type="button" onClick={eliminarEvento} disabled={guardando}><Trash2 size={16}/> Eliminar</button>}<button className="agenda-cancel-event" type="button" onClick={() => setEventoModal(false)} disabled={guardando}>Cancelar</button><button className="agenda-save-event" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : eventoId ? 'Guardar cambios' : 'Crear evento'}</button></footer></form></section></div>}
  </main>;
}
