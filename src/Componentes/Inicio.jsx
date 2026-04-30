import React, { useEffect, useState } from "react";
import "../css componentes/Inicio.css";
import { FaUser, FaRightFromBracket } from "react-icons/fa6";
import { FaHome, FaCalculator, FaCalendar, FaMapMarkerAlt, FaChartBar, FaBell, FaPlusCircle } from "react-icons/fa";
import Calculadora from "./Calculadora";
import Perfil from "./PerfilUsuario";

export default function Inicio() {
  const [activo, setActivo] = useState("home", "calculadora");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cultivos, setCultivos] = useState([]);
  const [nombreCultivo, setNombreCultivo] = React.useState('');
  const [fechaSiembra, setFechaSiembra] = React.useState('');
  const [fechaCosecha, setFechaCosecha] = React.useState('');
  const [estado, setEstado] = React.useState('');
  const [ubicacion, setUbicacion] = React.useState('');
  const [mensaje, setMensaje] = React.useState('');
  const [tipoMensaje, setTipoMensaje] = React.useState('');
  const [mostrar, setMostrar] = React.useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");

  const handleClick = () => {
    setMenuAbierto(!menuAbierto);
  };
  
  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;

    if (usuario && usuario.correo) {

      fetch(`http://127.0.0.1:8000/cultivos/${usuario.correo}`)
        .then((response) => response.json())
        .then((data) => {
          setCorreo(usuario.correo);
          setNombre(data.nombre);
          setCultivos(data.cultivos);
        })
        .catch((error) => {
          console.error("Error al obtener los cultivos:", error);
        });

    } else {
      window.location.href = "/";
    }
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };
  const handleAgregarCultivo = () => {
    setMostrarFormulario(true);
  }

  //Guardar cultivo

  const hadleGuardarCultivo = async (e) => {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!nombreCultivo || !fechaSiembra || !fechaCosecha || !estado || !ubicacion ) {
      setMensaje(' ⚠️ Por favor, complete todos los campos.');
      setTipoMensaje('error');
      setMostrar(true);
      setTimeout (() => setMostrar(false),4000)
      return;
    }

    try {
      const response = await fetch ("http://127.0.0.1:8000/cultivos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: usuario.correo,
          nombre: nombreCultivo,
          fechaSiembra: fechaSiembra,
          fechaCosecha: fechaCosecha,
          estado: estado,
          ubicacion: ubicacion
        }),                
      });
      const data = await response.json();

      if (response.ok){

        const nuevoCultivo = {
          id: data.id,
          nombre: nombreCultivo,
          fechaSiembra: fechaSiembra,
          fechaCosecha: fechaCosecha,
          estado: estado,
          ubicacion: ubicacion
        }
        setMensaje(data.mensaje || "Cultivo registrado correctamente");
        setTipoMensaje("exito");
        setCultivos([...cultivos, nuevoCultivo]);
        setMostrarFormulario(false);
        setNombreCultivo('');
        setFechaSiembra('');
        setFechaCosecha('');
        setEstado('');
        setUbicacion('');
        setMostrar(true);
        setTimeout (() => setMostrar(false), 4000);
      }else {
        setMensaje(data.detail || "Ocurrió un error en el registro");
        setTipoMensaje("error")
        setMostrar(true);
        setTimeout (() => setMostrar(false), 4000);
      }
    }catch (error) {
      setMensaje("No se pudo conectar con el servidor");
      setTipoMensaje("error");
      setMostrar(true);
      setTimeout (() => setMostrar(false),4000)
    }

  };

  //Eliminar cultivo
  const eliminarCultivo = async (id) => {

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  try {

    const response = await fetch(
      `http://127.0.0.1:8000/cultivos/${usuario.correo}/${id}`,
      {
        method: "DELETE"
      }
    );

    if (response.ok) {

      const nuevosCultivos = cultivos.filter(c => c.id !== id);
      setCultivos(nuevosCultivos);

    }

    } catch (error) {
      console.error("Error eliminando cultivo:", error);
    }

  };

  function calcularProgreso(siembra, cosecha) {

    const hoy = new Date();
    const fechaSiembra = new Date(siembra);
    const fechaCosecha = new Date(cosecha);

    const total = fechaCosecha - fechaSiembra;
    const transcurrido = hoy - fechaSiembra;

    let progreso = (transcurrido / total) * 100;

    if (progreso < 0) progreso = 0;
    if (progreso > 100) progreso = 100;

    return Math.round(progreso);
  }



  return (
    <>
      <header>
        <nav id="menu" className="bienvenida-usuario">
          <div className="menu">
            <button onClick={handleClick}>
              <img src="/Imagenes/menu.png" alt="Menú" />
            </button>
            <h2>Bienvenido {nombre ? nombre : "..."}</h2>
          </div>
        </nav>
        <ul className="sesion-datos">
          <li>
            <a href="#">
              <FaBell className="icon" />
            </a>
          </li>
          <button className="cerrar-sesion" onClick={handleCerrarSesion}>
              <FaRightFromBracket className="icon" /> Cerrar Sesión
          </button>
        </ul>
      </header>

      <main>
        {activo === "home" && (
          <div className="contenido-home">
            <h1>Mis Cultivos</h1>
            <button className="agregar-cultivo" onClick={handleAgregarCultivo}>
              <FaPlusCircle className="icon"/>Agregar Cultivo</button>
  
              {mostrarFormulario && (
                <div className="formulario-overlay">
                  <div className= "formulario-contenedor">
                    <h2>Agregar Nuevo Cultivo</h2>
                    <input type="text" placeholder="Nombre del cultivo" value={nombreCultivo} onChange={(e) => setNombreCultivo(e.target.value)} required/>
                    <input type="date" placeholder="Fecha de siembra" value={fechaSiembra} onChange={(e) => setFechaSiembra(e.target.value)} required/>
                    <input type="date" placeholder="Fecha de cosecha" value={fechaCosecha} onChange={(e) => setFechaCosecha(e.target.value)} required />
                    <select value={estado} onChange={(e) => setEstado(e.target.value)} required>
                      <option value="">Seleccionar estado</option>
                      <option value="siembra">Siembra</option>
                      <option value="crecimiento">Crecimiento</option>
                      <option value="cosecha">Cosecha</option>
                    </select>
                    <input type="text" placeholder="Ubicación del cultivo" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} required />
                    <div className="botones-formulario">
                      <button onClick={hadleGuardarCultivo }>Guardar Cultivo</button>
                      {mostrar && (
                        <div className={`mensaje ${tipoMensaje}`}>
                          {mensaje}
                        </div>
                      )}
                      <button onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                    </div>
                  </div>
                </div>
                  

              )}
            <div className="lista-cultivos">
              {cultivos.map((cultivo, index) => {
                const progreso = calcularProgreso(
                cultivo.fechaSiembra,
                cultivo.fechaCosecha
                );
                return (
                  <div key={cultivo.id} className="tarjeta-cultivo">
                    <h3>{cultivo.nombre}</h3>
                    <p>Siembra: {cultivo.fechaSiembra}</p>
                    <p>Cosecha: {cultivo.fechaCosecha}</p>
                    <p>Estado: {cultivo.estado}</p>
                    <p>Ubicación: {cultivo.ubicacion}</p>
                    <button onClick={() => eliminarCultivo(cultivo.id)}>Eliminar</button> 
                    <div className="barra-progreso">
                      <div className="progreso" style={{ width: `${progreso}%` }}></div>
                    </div>
                    <span>{progreso}% crecimiento</span>
                  </div>
                )
              })}
              </div>
          </div>
        )}
        {activo === "calculadora" && (
          <div className="contenido-calculadora">
            <h1>Calculadora de Cultivos</h1>
            <Calculadora />
          </div>
        )}

        {activo === "informacion" && (
          <div className="contenido-informacion">
            <h1>Información Personal</h1>
            <Perfil/> 
          </div>
        )}
      </main>
      {menuAbierto && (
        <div className="overlay" onClick={() => setMenuAbierto(false)}></div>
      )}
      <div className= {`sidebar ${menuAbierto ? "activo" : ""}`}> 
        <div className="perfil">
          <img src="/Imagenes/perfil.png" alt="Perfil" />
          <h3>{nombre ? nombre : "..."}</h3>
          <p>{correo ? correo : "..."}</p>
        </div>

        <ul className="barra-menu">
          <li className={activo === "home" ? "activo" : ""}
          onClick={()=>setActivo("home")} >
            <FaHome className="icono"/> Home </li>
          <li
            className={activo === "calculadora" ? "activo" : ""}
            onClick={() => setActivo("calculadora")}>
            <FaCalculator className="icono"/> Calculadora
          </li>
          <li className={activo === "ubicacion" ? "activo" : ""}
          onClick={()=>setActivo("ubicacion")}>
            <FaMapMarkerAlt className="icono"/> Ubicación</li>
          <li className={activo === "informacion" ? "activo" : ""}
          onClick={()=>setActivo("informacion")}>
            <FaUser className="icono"/> Información personal</li>
          <li className={activo === "estadisticas" ? "activo" : ""}
          onClick={()=>setActivo("estadisticas")}>
            <FaChartBar className="icono"/> Estadísticas generales</li>
        </ul>
      </div>
    </>
  );
}

