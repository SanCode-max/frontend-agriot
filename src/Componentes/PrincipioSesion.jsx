import React from 'react'
import '../css componentes/PrincipioSesion.css'
import { Link } from 'react-router-dom';

export default function PrincipioSesion() {
  return (
    <main className='contenedor-principal'>
        <div className='caja-principal'>
            <div className='bienvenida'>
                <h1>BIENVENIDO</h1>
                <img src="/Imagenes/logo_fondo.png"/>
                <div className='datos'>
                    <Link to="/registro">Registrarse</Link>
                    <Link to="/login">Iniciar Sesión</Link>
                </div>
            </div>
        </div>
    </main>
    
  )
}
