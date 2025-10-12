import React from 'react'
import '../css componentes/InicioSesion.css'

export default function InicioSesion() {
  return (
    <main className='contenedor-principal-login'>
        <div className='caja-login'>
            <h1>Iniciar Sesión</h1>
            <div className='formulario-login'>
                <form>
                    <input type="email" placeholder='Correo'/>
                    <input type="password" placeholder='Contraseña'/>
                    <button className='sesion'>Iniciar Sesión</button> 
                </form>
            </div>
            <div className='texto-login'>
               <p>
                ¿No tienes cuenta?{""}
                <a href="/registro">Registrarse</a>
               </p>
            </div>
        </div>
    </main>
  )
}
