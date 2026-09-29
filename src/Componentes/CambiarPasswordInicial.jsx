import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import '../css componentes/UsuarioDashboard.css';

export default function CambiarPasswordInicial() {
  const [actual, setActual] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function enviar(event) {
    event.preventDefault(); setError(''); setCargando(true);
    try {
      const response = await apiFetch('/password/change-initial', { method: 'POST', body: JSON.stringify({ password_actual: actual, password, password_confirmation: confirmacion }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || Object.values(data.errors || {}).flat()[0] || 'No se pudo cambiar la contraseña.');
      const user = JSON.parse(localStorage.getItem('usuario') || '{}');
      user.must_change_password = false;
      localStorage.setItem('usuario', JSON.stringify(user));
      navigate(user.rol === 'user' ? '/dashboard/usuario' : '/Inicio', { replace: true });
    } catch (e) { setError(e.message); } finally { setCargando(false); }
  }

  return <main className="agriot-auth-shell"><form className="agriot-form-card" onSubmit={enviar}>
    <span className="agriot-eyebrow">Seguridad de la cuenta</span><h1>Crea tu nueva contraseña</h1>
    <p>Este paso es obligatorio antes de acceder a AgrIoT.</p>
    <label>Contraseña temporal<input type="password" autoComplete="current-password" value={actual} onChange={e => setActual(e.target.value)} required /></label>
    <label>Nueva contraseña<input type="password" autoComplete="new-password" minLength="10" value={password} onChange={e => setPassword(e.target.value)} required /><small>Al menos 10 caracteres, con mayúscula, minúscula, número y símbolo.</small></label>
    <label>Confirmar nueva contraseña<input type="password" autoComplete="new-password" value={confirmacion} onChange={e => setConfirmacion(e.target.value)} required /></label>
    {error && <p className="agriot-error" role="alert">{error}</p>}
    <button className="agriot-button" disabled={cargando}>{cargando ? 'Guardando…' : 'Guardar contraseña'}</button>
  </form></main>;
}
