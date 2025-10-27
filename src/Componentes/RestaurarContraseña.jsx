  import React from 'react'
  import '../css componentes/Restaurar_Contraseña.css'

  export default function RestaurarContraseña() {
    const [Correo, setCorreo] = React.useState('');
    const [Mensaje, setMensaje] = React.useState('');
    const [TipoMensaje, setTipoMensaje] = React.useState('');
    const [Mostrar, setMostrar] = React.useState(false);

    const restaurarClick = async (e) => {
      e.preventDefault();

      if (!Correo){
        setMensaje(' ⚠️ Por favor, cescribe el correo electronico');
        setTipoMensaje('error');
        setMostrar(true);
        setTimeout (() => setMostrar(false),4000)
        return;
      }else if (!/\S+@\S+\.\S+/.test(Correo)){
        setMensaje('⚠️ Por favor, ingrese un correo electrónico válido.');
        setTipoMensaje('error');
        setMostrar(true);
        setTimeout (() => setMostrar(false),4000)
        return;
      }

      try{
        const response = await fetch("http://127.0.0.1:8000/request_password", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({correo: Correo}),
        });
        const data = await response.json();
        setMensaje(data.detail || " Enlace enviado con éxito al correo");
        setTipoMensaje("exito");
        setMostrar(true);
        setTimeout (() => setMostrar(false),5000);
        setCorreo("");
      } catch (error){
        setMensaje("No se pudo conectar con el servidor");
        setTipoMensaje("error");
        setMostrar(true);
        setTimeout (() => setMostrar(false),4000);
      }
    };
    return (
      <main className='contenedor-principal'>
        <div className='caja_recuperacion'>

          <h1>Indica el correo para reestablecer la contraseña</h1>
          <div className='apartado'>
            <input type="email" placeholder='Correo' value={Correo} onChange={(e) => setCorreo(e.target.value)}/>
          </div>
          <button className='EnviaCorreo' onClick={restaurarClick}> Enviar link </button>
          {Mostrar && (
            <div className={`mensaje ${TipoMensaje}`}>
              {Mensaje}
            </div>
          )}
        </div>
      </main>
    )
  }
