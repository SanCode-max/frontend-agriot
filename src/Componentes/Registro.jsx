import React, { useState } from 'react';
import '../css componentes/Registro.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock, FaArrowLeft } from "react-icons/fa";
import { apiFetch } from '../services/apiClient';

export default function Registro() {
    const navigate = useNavigate();
    const [Nombre, setNombre] = useState('');
    const [Apellido, setApellido] = useState('');
    const [Correo, setCorreo] = useState('');
    const [Telefono, setTelefono] = useState('');
    const [Contraseña, setContraseña] = useState('');
    const [Mensaje, setMensaje] = useState('');
    const [TipoMensaje, setTipoMensaje] = useState('');
    const [Mostrar, setMostrar] = useState(false);
    const [VerContraseña, setVerContraseña] = useState(false);
    const [Cargando, setCargando] = useState(false);

    const manejarCambioTelefono = (e) => {
        const valor = e.target.value;
        const soloNumeros = valor.replace(/\D/g, ""); 
        setTelefono(soloNumeros);
    };

    // Calcular la fortaleza de la contraseña para la barra interactiva
    const obtenerFortalezaContraseña = () => {
        if (!Contraseña) return { porcentaje: 0, clase: '', texto: '' };
        let puntos = 0;
        if (Contraseña.length >= 8) puntos += 25;
        if (/[A-Z]/.test(Contraseña)) puntos += 25;
        if (/[0-9]/.test(Contraseña)) puntos += 25;
        if (/[#$%&/()=?.]/.test(Contraseña)) puntos += 25;

        if (puntos <= 25) return { porcentaje: 25, clase: 'debil', texto: 'Débil' };
        if (puntos <= 75) return { porcentaje: 65, clase: 'media', texto: 'Media' };
        return { porcentaje: 100, clase: 'fuerte', texto: 'Segura' };
    };

    const fortaleza = obtenerFortalezaContraseña();

    const Click = async (e) => {
        e.preventDefault();

        if (!Nombre || !Apellido || !Telefono || !Correo || !Contraseña) {
            setMensaje('Por favor, complete todos los campos.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout(() => setMostrar(false), 4000);
            return;
        } else if (!/\S+@\S+\.\S+/.test(Correo)) {
            setMensaje('Por favor, ingrese un correo electrónico válido.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout(() => setMostrar(false), 4000);
            return;
        } else if (
            Contraseña.length < 8 ||
            !/[#$%&/()=?.]/.test(Contraseña) ||
            !/[a-z]/.test(Contraseña) || 
            !/[A-Z]/.test(Contraseña) || 
            !/[0-9]/.test(Contraseña)
        ) {
            setMensaje('La contraseña debe tener al menos 8 caracteres, mayúscula, número y un carácter especial.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout(() => setMostrar(false), 4000);
            return;
        }

        setCargando(true);

        try {
            const response = await apiFetch("/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: Nombre,
                    apellido: Apellido,
                    telefono: Telefono,
                    correo: Correo,
                    password: Contraseña,
                }),                
            });
            const data = await response.json();

            if (response.ok) {
                setMensaje(data.mensaje || "Usuario registrado correctamente");
                setTipoMensaje("exito");
                setNombre("");
                setApellido("");
                setCorreo("");
                setTelefono("");
                setContraseña("");
                setMostrar(true);
                setTimeout(() => setMostrar(false), 4000);
                setTimeout(() => { navigate("/login"); }, 1200);
            } else {
                setMensaje(data.detail || "Ocurrió un error en el registro");
                setTipoMensaje("error");
                setMostrar(true);
                setTimeout(() => setMostrar(false), 4000);
            }
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
        <main className='contenedor-principal-registro'>
            <div className="overlay-fondo-registro"></div>

            {/* Botón flotante para volver */}
            <Link to="/" className="btn-volver-registro">
                <FaArrowLeft /> <span>Volver al inicio</span>
            </Link>

            <div className='caja-registro'>
                <div className="header-card-registro">
                    <span className="badge-registro">Comunidad AgrIoT</span>
                    <h1>Crear Cuenta</h1>
                    <p>Únete a la plataforma de monitoreo inteligente</p>
                </div>

                <div className='formulario-registro'>
                    <form onSubmit={Click}>
                        {/* Fila Doble: Nombres y Apellidos */}
                        <div className="grid-dos-campos">
                            <div className="group-input-registro">
                                <FaUser className="icon-input-left" />
                                <input 
                                    type="text" 
                                    placeholder='Nombres' 
                                    value={Nombre} 
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="group-input-registro">
                                <FaUser className="icon-input-left" />
                                <input 
                                    type="text" 
                                    placeholder='Apellidos' 
                                    value={Apellido} 
                                    onChange={(e) => setApellido(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div className="group-input-registro">
                            <FaPhone className="icon-input-left" />
                            <input 
                                type='tel' 
                                placeholder='Teléfono (10 dígitos)' 
                                value={Telefono} 
                                onChange={manejarCambioTelefono} 
                                maxLength={10}
                                required
                            />
                        </div>

                        {/* Correo */}
                        <div className="group-input-registro">
                            <FaEnvelope className="icon-input-left" />
                            <input 
                                type="email" 
                                placeholder='Correo electrónico' 
                                value={Correo} 
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                            />
                        </div>

                        {/* Contraseña */}
                        <div className='group-input-registro contraseña-registro'>
                            <FaLock className="icon-input-left" />
                            <input 
                                type={VerContraseña ? "text" : "password"}  
                                placeholder='Contraseña' 
                                value={Contraseña} 
                                onChange={(e) => setContraseña(e.target.value)}
                                required
                            />
                            <span className='ojo-registro' onClick={() => setVerContraseña(!VerContraseña)}>
                                {VerContraseña ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        {/* Barra de fortaleza de contraseña */}
                        {Contraseña && (
                            <div className="fortaleza-wrapper">
                                <div className="fortaleza-barra-fondo">
                                    <div 
                                        className={`fortaleza-barra-progreso ${fortaleza.clase}`} 
                                        style={{ width: `${fortaleza.porcentaje}%` }}
                                    ></div>
                                </div>
                                <span className={`fortaleza-texto ${fortaleza.clase}`}>
                                    Seguridad: {fortaleza.texto}
                                </span>
                            </div>
                        )}

                        <button type="submit" className='btn-registro-submit' disabled={Cargando}>
                            {Cargando ? "Registrando..." : "Registrarse"}
                        </button>

                        {/* Banner de Mensajes / Notificación */}
                        {Mostrar && (
                            <div className={`mensaje-toast ${TipoMensaje}`}>
                                {Mensaje}
                            </div>
                        )}
                    </form>
                </div>

                <div className='texto-registro-footer'>
                    <p>
                        ¿Ya tienes una cuenta?{" "}
                        <Link to="/login" className="link-login">Iniciar sesión</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}