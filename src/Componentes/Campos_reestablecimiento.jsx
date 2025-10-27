import React, {useState} from 'react';
import '../css componentes/Restaurar_Contraseña.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams } from 'react-router-dom';

export default function Campos_reestablecimiento() {
    const [params] = useSearchParams();
    const token = params.get('token');
    const [Ncontraseña, setNcontraseña] = React.useState('');
    const [Ccontraseña, setCcontraseña] = React.useState('');
    const [Mensaje, setMensaje] = React.useState('');
    const [TipoMensaje, setTipoMensaje] = React.useState('');
    const [Mostrar, setMostrar] = React.useState(false);
    const [VerContraseñaN, setVerContraseñaN] = React.useState(false);
    const [VerContraseñaC, setVerContraseñaC] = React.useState(false);

    const camposClick = async (e) => {
        e.preventDefault();

        if (!Ncontraseña || !Ccontraseña){
            setMensaje(' ⚠️ Por favor, complete todos los campos.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout (() => setMostrar(false),4000)
            return;
        } else if (Ncontraseña !== Ccontraseña){
            setMensaje(' ⚠️ Las contraseñas no coinciden.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout (() => setMostrar(false),4000)
            return;
        }else if (Ncontraseña.length < 8 ||
            !/[#$%&/()=?.]/.test(Ncontraseña) ||
            !/[a-z]/.test(Ncontraseña) || 
            !/[A-Z]/.test(Ncontraseña) || 
            !/[0-9]/.test(Ncontraseña)) {
            setMensaje('⚠️ La contraseña debe tener al menos 8 caracteres, una mayuscula, un numero o caracteres especiales /[#$%&/()=?]/.');
            setTipoMensaje('error');
            setMostrar(true);
            setTimeout (() => setMostrar(false),4000)
            return;
        }

        try {
            const response = await fetch ("http://127.0.0.1:8000/reset_password",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token,
                    nueva_password: Ncontraseña,
                    confirmacion_password: Ccontraseña,
                }),
            });
            const data = await response.json();

            if (response.ok){
                setMensaje(data.detail || "Contraseña reestablecida con éxito")
                setTipoMensaje("exito");
                setMostrar(true);
                setTimeout (() => setMostrar(false),4000)
                setNcontraseña("");
                setCcontraseña("");
                setTimeout(() => {window.location.href = "/login"; },2000);
            } else {
                setMensaje(data.detail || "Error al reestablecer la contraseña");
                setTipoMensaje("error");
                setMostrar(true);
                setTimeout (() => setMostrar(false),4000)
            }

        } catch (error) {
            setMensaje("No se pudo conectar con el servidor");
            setTipoMensaje("error");
            setMostrar(true);
            setTimeout (() => setMostrar(false),4000)
        }
    };
  return (
    <main className='contenedor-principal'>
        <div className='caja_recuperacion'>
            <h1>Registra la nueva contraseña</h1>
            <div className='apartado'>
                <div className='contenedor_nueva_contraseña'>
                    <input type={VerContraseñaN ? "text" : "password"} placeholder='Nueva contraseña' value={Ncontraseña} onChange={(e) => setNcontraseña(e.target.value)}/>
                    <span className='ojo' onClick={() => setVerContraseñaN(!VerContraseñaN)}> {VerContraseñaN ? <FaEyeSlash/> : <FaEye/>} </span>
                </div>
                <div className='contenedor_confirmacion_contraseña'>
                    <input type={VerContraseñaC ? "text" : "password"} placeholder='Confirmar nueva contraseña' value={Ccontraseña} onChange={(e) => setCcontraseña(e.target.value)}/>
                    <span className='ojo' onClick={() => setVerContraseñaC(!VerContraseñaC)}> {VerContraseñaC ? <FaEyeSlash/> : <FaEye/>} </span>
                </div>
            </div>
            <button className='RestaurarC' onClick={camposClick}> Actualizar </button>
            {Mostrar && (
            <div className={`mensaje ${TipoMensaje}`}>
              {Mensaje}
            </div>
            )}
        </div>
      </main>
  )
}
