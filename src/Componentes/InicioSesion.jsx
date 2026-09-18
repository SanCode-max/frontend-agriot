import React, { useState } from 'react';
import '../css componentes/InicioSesion.css';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';

export default function InicioSesion() {
    const navigate = useNavigate();

    // Estados del formulario
    const [Correo, setCorreo] = useState('');
    const [Contraseña, setContraseña] = useState('');
    const [CodigoOtp, setCodigoOtp] = useState('');

    // Control de flujo (Paso 1: Credenciales | Paso 2: Código OTP)
    const [PasoMfa, setPasoMfa] = useState(false);

    // Estados de interfaz y mensajes
    const [Mensaje, setMensaje] = useState('');
    const [TipoMensaje, setTipoMensaje] = useState('');
    const [Mostrar, setMostrar] = useState(false);
    const [VerContraseña, setVerContraseña] = useState(false);
    const [Cargando, setCargando] = useState(false);

    // PASO 1: Enviar credenciales y solicitar código de 6 dígitos
    const loginClick = async (e) => {
        e.preventDefault();

        if (!Correo || !Contraseña) {
            mostrarToast('Por favor, complete todos los campos.', 'error');
            return;
        }

        setCargando(true);

        try {
            const respuesta = await apiFetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo: Correo, password: Contraseña }),
            });

            const data = await respuesta.json();

            if (respuesta.ok && data.requiere_2fa) {
                setPasoMfa(true); // Cambia la vista al formulario de 6 dígitos
                mostrarToast("Código enviado a tu correo electrónico.", "exito");
            } else {
                mostrarToast(data.detail || "Correo o contraseña incorrectos", "error");
            }
        } catch (error) {
            mostrarToast("No se pudo conectar con el servidor.", "error");
        } finally {
            setCargando(false);
        }
    };

    // PASO 2: Verificar el código OTP de 6 dígitos e ingresar
    const verificarCodigoClick = async (e) => {
        e.preventDefault();

        if (!CodigoOtp || CodigoOtp.length !== 6) {
            mostrarToast('Ingresa el código de 6 dígitos.', 'error');
            return;
        }

        setCargando(true);

        try {
            const respuesta = await apiFetch("/verificar_login_2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo: Correo, codigo: CodigoOtp }),
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                mostrarToast("¡Autenticación completada! Ingresando...", "exito");

                // Guardar datos en localStorage y redirigir
                const usuarioData = {
                    ...data.usuario,
                    rol: data.usuario?.rol || 'administrador'
                };
                localStorage.setItem("usuario", JSON.stringify(usuarioData));

                setTimeout(() => {
                    navigate("/Inicio");
                }, 1200);
            } else {
                mostrarToast(data.detail || "Código incorrecto o caducado", "error");
            }
        } catch (error) {
            mostrarToast("No se pudo verificar el código.", "error");
        } finally {
            setCargando(false);
        }
    };

    const mostrarToast = (texto, tipo) => {
        setMensaje(texto);
        setTipoMensaje(tipo);
        setMostrar(true);
        setTimeout(() => setMostrar(false), 4500);
    };

    return (
        <main className='contenedor-principal-login'>
            <div className="overlay-fondo-login"></div>

            <Link to="/" className="btn-volver-login">
                <FaArrowLeft /> <span>Volver al inicio</span>
            </Link>

            <div className='caja-login'>
                {!PasoMfa ? (
                    /* PANTALLA PASO 1: CORREO Y CONTRASEÑA */
                    <>
                        <div className="header-card-login">
                            <span className="badge-login">Acceso a la Plataforma</span>
                            <h1>Iniciar Sesión</h1>
                            <p>Ingresa tus credenciales de acceso</p>
                        </div>

                        <div className='formulario-login'>
                            <form onSubmit={loginClick}>
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

                                <div className="olvido-password-wrapper">
                                    <Link to='/Restauracion' className="link-olvido">¿Olvidaste tu contraseña?</Link>
                                </div>

                                <button type="submit" className='btn-sesion-submit' disabled={Cargando}>
                                    {Cargando ? "Validando..." : "Continuar"}
                                </button>

                                {Mostrar && (
                                    <div className={`mensaje-toast ${TipoMensaje}`}>
                                        {Mensaje}
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className='texto-login-footer'>
                            <p>
                                ¿No tienes una cuenta aún?{" "}
                                <Link to="/registro" className="link-registro">Registrarse</Link>
                            </p>
                        </div>
                    </>
                ) : (
                    /* PANTALLA PASO 2: INGRESO DEL CÓDIGO OTP (6 DÍGITOS) */
                    <>
                        <div className="header-card-login">
                            <span className="badge-login">Seguridad de la Cuenta</span>
                            <h1>Verificación 2FA</h1>
                            <p>Ingresa el código de 6 dígitos enviado a <strong>{Correo}</strong></p>
                        </div>

                        <div className='formulario-login'>
                            <form onSubmit={verificarCodigoClick}>
                                <div className="group-input-login">
                                    <FaShieldAlt className="icon-input-left" />
                                    <input 
                                        type="text" 
                                        maxLength="6"
                                        placeholder='000000' 
                                        value={CodigoOtp} 
                                        onChange={(e) => setCodigoOtp(e.target.value.replace(/\D/g, ''))}
                                        style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '20px', fontWeight: 'bold' }}
                                        disabled={Cargando}
                                        autoFocus
                                        required
                                    />
                                </div>

                                <button type="submit" className='btn-sesion-submit' disabled={Cargando}>
                                    {Cargando ? "Verificando..." : "Verificar e Ingresar"}
                                </button>

                                <button 
                                    type="button" 
                                    className='btn-cancelar-pro' 
                                    onClick={() => setPasoMfa(false)}
                                    disabled={Cargando}
                                    style={{ marginTop: '10px', width: '100%' }}
                                >
                                    Volver al formulario
                                </button>

                                {Mostrar && (
                                    <div className={`mensaje-toast ${TipoMensaje}`}>
                                        {Mensaje}
                                    </div>
                                )}
                            </form>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}