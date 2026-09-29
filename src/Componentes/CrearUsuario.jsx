import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import './UsuarioDashboard.css';

export default function CrearUsuario({ embedded = false }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', rol: 'user' });
  const [mensaje, setMensaje] = useState(''); const [error, setError] = useState(''); const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setError(''); setMensaje(''); setCargando(true);
    try {
      const response = await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || Object.values(data.errors || {}).flat()[0] || 'No se pudo crear el usuario.');
      setMensaje(data.mensaje); setForm({ nombre: '', apellido: '', correo: '', rol: 'user' });
    } catch (e) { setError(e.message); } finally { setCargando(false); }
  }
  return <section className={embedded ? 'agriot-admin-module' : 'agriot-auth-shell'}><form className="agriot-form-card" onSubmit={submit}>
    {!embedded && <button type="button" className="agriot-back" onClick={() => navigate(-1)}>← Volver</button>}<span className="agriot-eyebrow">Administración</span><h1>Crear operario</h1><p>Enviaremos una contraseña temporal al correo indicado. El operario deberá cambiarla al ingresar.</p>
    <label>Nombres<input name="nombre" autoComplete="given-name" value={form.nombre} onChange={change} maxLength="100" required /></label>
    <label>Apellidos<input name="apellido" autoComplete="family-name" value={form.apellido} onChange={change} maxLength="100" required /></label>
    <label>Correo electrónico<input name="correo" type="email" autoComplete="email" value={form.correo} onChange={change} maxLength="150" required /></label>
    <label>Rol<select name="rol" value="user" disabled><option value="user">Operario</option></select></label>
    {mensaje && <p className="agriot-success" role="status">{mensaje}</p>}{error && <p className="agriot-error" role="alert">{error}</p>}
    <button className="agriot-button" disabled={cargando}>{cargando ? 'Creando usuario…' : 'Crear y enviar credenciales'}</button>
  </form></section>;
}
