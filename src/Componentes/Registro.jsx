import React from 'react'
import '../css componentes/Registro.css'
import { Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from "react-icons/fa";
let Click;
export default function Registro() {
    const [Nombre, setNombre] = React.useState('');
    const [Apellido, setApellido] = React.useState('');
    const [Correo, setCorreo] = React.useState('');
    const [Contraseña, setContraseña] = React.useState('');
    const [Mensaje, setMensaje] = React.useState('');
    const [TipoMensaje, setTipoMensaje] = React.useState('');
    const [Mostrar, setMostrar] = React.useState(false);
    const [VerContraseña, setVerContraseña] = React.useState(false);

    const Click = (e) => {
        e.preventDefault();

        if (!Nombre || !Apellido || !Correo || !Contraseña) {
            setMensaje(' ⚠️ Por favor, complete todos los campos.');
            setTipoMensaje('error');
            setMostrar(true);
        } else if (!/\S+@\S+\.\S+/.test(Correo)) {
            setMensaje('⚠️ Por favor, ingrese un correo electrónico válido.');
            setTipoMensaje('error');
            setMostrar(true);
        }else if (Contraseña.length < 6 || !/[#$%&/()=?.]/.test(Contraseña)) {
            setMensaje('⚠️ La contraseña debe tener al menos 6 caracteres o caracteres especiales /[#$%&/()=?]/.');
            setTipoMensaje('error');
            setMostrar(true);
        }else {
            setMensaje(`¡Registro exitoso ${Nombre}!`);
            setTipoMensaje('exito');
            //Limpiar los campos del formulario
            setNombre('');
            setApellido('');
            setCorreo('');
            setContraseña('');
        }
        setTimeout (() => {
            setMostrar(false);
        }, 4000)
    };
  return (
    <main className='contenedor-principal'>
        <div className= 'caja'>
            <h1>Registro</h1>
            <div className='formulario'>
                <form>
                    <input type="text" placeholder='Nombres' value={Nombre} onChange={(e) => setNombre(e.target.value)}/>
                    <input type="text" placeholder='Apellidos' value={Apellido} onChange={(e) => setApellido(e.target.value)}/>
                    <input type="email" placeholder='Correo' value={Correo} onChange={(e) => setCorreo(e.target.value)}/>
                    <div className='contenedor-contraseña'>
                        <input type= {VerContraseña ? "text" : "password"}  placeholder='Contraseña' value={Contraseña} onChange={(e)=> setContraseña(e.target.value)}/>
                        <span className='ojo' onClick={() => setVerContraseña(!VerContraseña)} >  {VerContraseña ? <FaEyeSlash/> : <FaEye/>} </span>
                    </div>
                    
                    <button className='registro' onClick={Click}>Registrarse</button> 
                    {Mostrar && (
                        <div className={`mensaje ${TipoMensaje}`}>
                            {Mensaje}
                        </div>
                    )}
                </form>
            </div>
            <div className='texto'>
               <p>
                ¿Ya tienes cuenta?{""}
                <Link to="/login">Iniciar sesión</Link>
               </p>
                
            </div>
        </div>
    </main>
  )
}
