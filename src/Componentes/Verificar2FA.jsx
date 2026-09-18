import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';

export default function Verificar2FA() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get('token');
  const correo = params.get('correo');

  const [estado, setEstado] = useState("Verificando autenticación...");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token || !correo) {
      setEstado("Enlace de verificación inválido.");
      setError(true);
      return;
    }

    apiFetch('/verificar_login_2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, correo })
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          // Guardar sesión en localStorage
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
          setEstado("¡Autenticación completada! Redirigiendo al Dashboard...");
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setEstado(data.detail || "Error al verificar la autenticación.");
          setError(true);
        }
      })
      .catch(() => {
        setEstado("No se pudo conectar con el servidor.");
        setError(true);
      });
  }, [token, correo, navigate]);

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Autenticación Multifactor (2FA)</h2>
      <p style={{ color: error ? 'red' : 'green', fontSize: '18px' }}>{estado}</p>
    </div>
  );
}