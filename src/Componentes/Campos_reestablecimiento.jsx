import React from 'react';
import '../css componentes/Restaurar_Contraseña.css';
import { FaEye, FaEyeSlash, FaKey, FaArrowLeft, FaLock } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';

export default function Campos_reestablecimiento() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    
    // Extracción del token y correo recibidos desde los parámetros de la URL del email
    const token = params.get('token');
    const correo = params.get('correo');

    const [Ncontraseña, setNcontraseña] = React.useState('');
    const [Ccontraseña, setCcontraseña] = React.useState('');
    const [Mensaje, setMensaje] = React.useState('');
    const [TipoMensaje, setTipoMensaje] = React.useState('');
    const [Mostrar, setMostrar] = React.useState(false);
    const [VerContraseñaN, setVerContraseñaN] = React.useState(false);
    const [VerContraseñaC, setVerContraseñaC] = React.useState(false);

    const camposClick = async (e) => {
        e.preventDefault();

        if (!Ncontraseña || !Ccontraseña) {
            setMensaje('⚠️ Por favor, complete todos los campos.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout(() => setMostrar(false), 4000);
            return;
        } else if (Ncontraseña !== Ccontraseña) {
            setMensaje('⚠️ Las contraseñas no coinciden.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout(() => setMostrar(false), 4000);
            return;
        } else if (
            Ncontraseña.length < 8 ||
            !/[#$%&\/()=?.]/.test(Ncontraseña) || 
            !/[a-z]/.test(Ncontraseña) || 
            !/[A-Z]/.test(Ncontraseña) || 
            !/[0-9]/.test(Ncontraseña)
        ) {
            setMensaje('⚠️ La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout(() => setMostrar(false), 4000);
            return;
        }

        try {
            const response = await apiFetch("/reset_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    correo,
                    token,
                    password: Ncontraseña, // Nombre del parámetro coincidente con Laravel
                }),
            });
            const data = await response.json();

            if (response.ok) {
                setMensaje(data.detail || "Contraseña restablecida con éxito.");
                setTipoMensaje("exito");
                setMostrar(true);
                setNcontraseña("");
                setCcontraseña("");
                setTimeout(() => { navigate("/login"); }, 2000);
            } else {
                setMensaje(data.detail || "Error al restablecer la contraseña.");
                setTipoMensaje("error");
                setMostrar(true);
                setTimeout(() => setMostrar(false), 4000);
            }

        } catch (error) {
            setMensaje("No se pudo conectar con el servidor.");
            setTipoMensaje("error");
            setMostrar(true);
            setTimeout(() => setMostrar(false), 4000);
        }
    };

    return (
        <main className='contenedor-principal-restaurar'>
            <div className="overlay-fondo-restaurar"></div>

            {/* Botón flotante para regresar al Login */}
            <Link to="/login" className="btn-volver-restaurar">
                <FaArrowLeft /> <span>Volver al Login</span>
            </Link>

            <div className='caja_recuperacion'>
                <header className="header-card-restaurar">
                    <div className="icon-badge-restaurar">
                        <FaKey />
                    </div>
                    <span className="badge-restaurar">SEGURIDAD DE LA CUENTA</span>
                    <h1>Nueva Contraseña</h1>
                    <p>Ingresa y confirma tu nueva clave de acceso para actualizar tu cuenta.</p>
                </header>

                <form className="formulario-restaurar" onSubmit={camposClick}>
                    <div className='group-input-restaurar'>
                        <FaLock className="icon-input-left" />
                        <input 
                            type={VerContraseñaN ? "text" : "password"} 
                            placeholder='Nueva contraseña' 
                            value={Ncontraseña} 
                            onChange={(e) => setNcontraseña(e.target.value)}
                        />
                        <span className='ojo' onClick={() => setVerContraseñaN(!VerContraseñaN)}> 
                            {VerContraseñaN ? <FaEyeSlash/> : <FaEye/>} 
                        </span>
                    </div>

                    <div className='group-input-restaurar'>
                        <FaLock className="icon-input-left" />
                        <input 
                            type={VerContraseñaC ? "text" : "password"} 
                            placeholder='Confirmar nueva contraseña' 
                            value={Ccontraseña} 
                            onChange={(e) => setCcontraseña(e.target.value)}
                        />
                        <span className='ojo' onClick={() => setVerContraseñaC(!VerContraseñaC)}> 
                            {VerContraseñaC ? <FaEyeSlash/> : <FaEye/>} 
                        </span>
                    </div>

                    <button type="submit" className='btn-restaurar-submit'>
                        Actualizar Contraseña
                    </button>
                </form>

                {Mostrar && (
                    <div className={`mensaje-toast ${TipoMensaje}`}>
                        {Mensaje}
                    </div>
                )}

                <footer className="texto-restaurar-footer">
                    <p>
                        ¿Recordaste tu contraseña? 
                        <Link to="/login" className="link-login">Iniciar sesión</Link>
                    </p>
                </footer>
            </div>
        </main>
    );
}