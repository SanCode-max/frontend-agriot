import React from 'react'

export default function Registro() {
  return (
    <div>
        Registro
        <form>
            <input type="text" placeholder='Nombre'/>
            <input type="text" placeholder='Apellido'/>
            <input type="email" placeholder='Correo'/>
            <input type="password" placeholder='Contraseña'/>
            <button>Registrarse</button>
        </form>
    </div>
  )
}
