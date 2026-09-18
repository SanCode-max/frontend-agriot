import React, { useState } from 'react';
import '../css componentes/InicioSesion.css';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';

export default function InicioSesion() {
    const [Correo, setCorreo] = useState('');
    const [Contraseña, setContraseña] = useState('');
    const [Mensaje, setMensaje] = useState('');
    const [TipoMensaje, setTipoMensaje] = useState('');
    const [Mostrar, setMostrar] = useState(false);
    const [VerContraseña, setVerContraseña] = useState(false);
    const [Cargando, setCargando] = useState(false);

    const loginClick = async (e) => {
        e.preventDefault();

        if (!Correo || !Contraseña) {
            setMensaje('Por favor, complete todos los campos.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout(() => setMostrar(false), 4000);
            return;
        }

        setCargando(true);

        try {
            const respuesta = await apiFetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    correo: Correo,
                    password: Contraseña
                }),
            });

            const data = await respuesta.json();

            if (respuesta.ok && data.requiere_2fa) {
                // Notificación de envío del enlace mágico 2FA
                setMensaje(data.detail || "Credenciales correctas. Se ha enviado un enlace de acceso a tu correo electrónico.");
                setTipoMensaje("exito");
                setMostrar(true);

                // Limpiamos los campos del formulario por seguridad
                setCorreo('');
                setContraseña('');

                // Mantenemos la notificación visible durante 8 segundos
                setTimeout(() => { 
                    setMostrar(false);
                }, 8000);
            } else {
                setMensaje(data.detail || "Correo o contraseña incorrectos");
                setTipoMensaje("error");
                setMostrar(true);
                setTimeout(() => setMostrar(false), 5000);
            }
        } catch (error) {
            setMensaje("No se pudo conectar con el servidor.");
            setTipoMensaje("error");
            setMostrar(true);
            setTimeout(() => setMostrar(false), 5000);
        } finally {
            setCargando(false);
        }
    };

    return (
        <main className='contenedor-principal-login'>
            <div className="overlay-fondo-login"></div>

            {/* Botón flotante para volver */}
            <Link to="/" className="btn-volver-login">
                <FaArrowLeft /> <span>Volver al inicio</span>
            </Link>

            <div className='caja-login'>
                {/* Branding AgrIoT */}
                <div className="header-card-login">
                    <span className="badge-login">Acceso a la Plataforma</span>
                    <h1>Iniciar Sesión</h1>
                    <p>Ingresa tus credenciales para recibir tu enlace seguro de acceso</p>
                </div>

                <div className='formulario-login'>
                    <form onSubmit={loginClick}>
                        {/* Campo Correo */}
                        <div className="group-input-login">
                            <FaEnvelope className="icon-input-left" />
                            <input 
                                type="email" 
                                placeholder='Correo electrónico' 
                                value={Correo} 
                                onChange={(e) => setCorreo(e.target.value)}
                                disabled={Cargando}
                                required
                            />
                        </div>

                        {/* Campo Contraseña */}
                        <div className='group-input-login contraseña-login'>
                            <FaLock className="icon-input-left" />
                            <input 
                                type={VerContraseña ? "text" : "password"}  
                                placeholder='Contraseña' 
                                value={Contraseña} 
                                onChange={(e) => setContraseña(e.target.value)}
                                disabled={Cargando}
                                required
                            />
                            <span className='ojo-login' onClick={() => setVerContraseña(!VerContraseña)}>
                                {VerContraseña ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        {/* Enlace de recuperación */}
                        <div className="olvido-password-wrapper">
                            <Link to='/Restauracion' className="link-olvido">¿Olvidaste tu contraseña?</Link>
                        </div>

                        {/* Botón Acción */}
                        <button type="submit" className='btn-sesion-submit' disabled={Cargando}>
                            {Cargando ? "Verificando..." : "Enviar Enlace de Acceso"}
                        </button>

                        {/* Banner de Mensajes / Notificación */}
                        {Mostrar && (
                            <div className={`mensaje-toast ${TipoMensaje}`}>
                                {Mensaje}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer del Formulario */}
                <div className='texto-login-footer'>
                    <p>
                        ¿No tienes una cuenta aún?{" "}
                        <Link to="/registro" className="link-registro">Registrarse</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}