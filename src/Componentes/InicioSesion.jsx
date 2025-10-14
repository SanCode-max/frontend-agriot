import React from 'react'
import '../css componentes/InicioSesion.css'
import {FaEye, FaEyeSlash} from "react-icons/fa"
import { click } from '@testing-library/user-event/dist/click';

export default function InicioSesion() {
    const [Correo, setCorreo] = React.useState('');
    const [Contraseña, setContraseña] = React.useState('');
    const [Mensaje, setMensaje] = React.useState('');
    const [TipoMensaje, setTipoMensaje] = React.useState('');
    const [Mostrar, setMostrar] = React.useState(false);
    const [VerContraseña, setVerContraseña] = React.useState(false);


    const loginClick = (e) => {
        e.preventDefault();
        if (!Correo || !Contraseña){
            setMensaje(' ⚠️ Por favor, complete todos los campos.');
            setTipoMensaje('error');
            setMostrar(true)
            setTimeout (() => setMostrar(false), 4000)
        }
    }

  return (
    <main className='contenedor-principal-login'>
        <div className='caja-login'>
            <h1>Iniciar Sesión</h1>
            <div className='formulario-login'>
                <form>
                    <input type="email" placeholder='Correo' value={Correo} onChange={(e) => setCorreo(e.target.value)}/>
                    <div className='contraseña-login'>
                        <input type= {VerContraseña ? "text" : "password"}  placeholder='Contraseña' value={Contraseña} onChange={(e)=> setContraseña(e.target.value)}/>
                        <span className='ojo-login' onClick={() => setVerContraseña(!VerContraseña)} >  {VerContraseña ? <FaEyeSlash/> : <FaEye/>} </span>
                    </div>
                    
                    <button className='sesion' onClick={loginClick}>Iniciar Sesión</button> 
                    {Mostrar && (
                        <div className={`mensaje ${TipoMensaje}`}>
                            {Mensaje}
                        </div>
                    )}
                </form>
            </div>
            <div className='texto-login'>
               <p>
                ¿No tienes cuenta?{""}
                <a href="/registro">Registrarse</a> <br/>
               </p>
                <a href='/Restauracion'>¿Olvidaste la contraseña?</a>
            </div>
        </div>
    </main>
  )
}
