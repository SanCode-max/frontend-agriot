import React, { useState } from 'react';
import '../css componentes/Restaurar_Contraseña.css';
import { FaEnvelope, FaArrowLeft, FaKey } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';

export default function RestaurarContraseña() {
  const [Correo, setCorreo] = useState('');
  const [Mensaje, setMensaje] = useState('');
  const [TipoMensaje, setTipoMensaje] = useState('');
  const [Mostrar, setMostrar] = useState(false);
  const [Cargando, setCargando] = useState(false);

  const restaurarClick = async (e) => {
    e.preventDefault();

    if (!Correo) {
      setMensaje('Por favor, escribe tu correo electrónico.');
      setTipoMensaje('error');
      setMostrar(true);
      setTimeout(() => setMostrar(false), 4000);
      return;
    } else if (!/\S+@\S+\.\S+/.test(Correo)) {
      setMensaje('Por favor, ingresa un correo electrónico válido.');
      setTipoMensaje('error');
      setMostrar(true);
      setTimeout(() => setMostrar(false), 4000);
      return;
    }

    setCargando(true);

    try {
      const response = await apiFetch("/request_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: Correo }),
      });
      const data = await response.json();
      setMensaje(data.detail || "Enlace enviado con éxito a tu correo.");
      setTipoMensaje("exito");
      setMostrar(true);
      setTimeout(() => setMostrar(false), 5000);
      setCorreo("");
    } catch (error) {
      setMensaje("No se pudo conectar con el servidor");
      setTipoMensaje("error");
      setMostrar(true);
      setTimeout(() => setMostrar(false), 4000);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className='contenedor-principal-restaurar'>
      <div className="overlay-fondo-restaurar"></div>

      {/* Botón flotante para volver a Iniciar Sesión */}
      <Link to="/login" className="btn-volver-restaurar">
        <FaArrowLeft /> <span>Volver al Login</span>
      </Link>

      <div className='caja_recuperacion'>
        <div className="header-card-restaurar">
          <div className="icon-badge-restaurar">
            <FaKey />
          </div>
          <span className="badge-restaurar">Seguridad de la Cuenta</span>
          <h1>Recuperar Contraseña</h1>
          <p>Ingresa tu correo registrado y te enviaremos las instrucciones para restablecer tu contraseña.</p>
        </div>

        <div className='formulario-restaurar'>
          <form onSubmit={restaurarClick}>
            <div className='group-input-restaurar'>
              <FaEnvelope className="icon-input-left" />
              <input 
                type="email" 
                placeholder='Correo electrónico' 
                value={Correo} 
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <button type="submit" className='btn-restaurar-submit' disabled={Cargando}>
              {Cargando ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>

            {/* Notificación Toast */}
            {Mostrar && (
              <div className={`mensaje-toast ${TipoMensaje}`}>
                {Mensaje}
              </div>
            )}
          </form>
        </div>

        <div className='texto-restaurar-footer'>
          <p>
            ¿Recordaste tu contraseña?{" "}
            <Link to="/login" className="link-login">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </main>
  );
}