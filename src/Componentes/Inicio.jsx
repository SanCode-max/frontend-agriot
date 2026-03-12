import React, { useEffect, useState } from "react";
import "../css componentes/Inicio.css";
import { FaUser, FaRightFromBracket } from "react-icons/fa6";
import { FaHome, FaCalculator, FaCalendar, FaMapMarkerAlt, FaChartBar } from "react-icons/fa";


export default function Inicio() {
  const [activo, setActivo] = useState("home");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const handleClick = () => {
    setMenuAbierto(!menuAbierto);
  };

  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;
    console.log("Usuario almacenado:", usuario);

    if (usuario && usuario.correo) {
      fetch(`http://127.0.0.1:8000/usuario/${usuario.correo}`)
        .then((response) => response.json())
        .then((data) => {
          setNombre(data.nombre);
        })
        .catch((error) => {
          console.error("Error al obtener los datos del usuario:", error);
        });
    }
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

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
              <FaUser className="icon" /> Información personal
            </a>
          </li>
          <button className="cerrar-sesion" onClick={handleCerrarSesion}>
              <FaRightFromBracket className="icon" /> Cerrar Sesión
          </button>
        </ul>
      </header>
      {menuAbierto && (
        <div className="overlay" onClick={() => setMenuAbierto(false)}></div>
      )}
      <div className= {`sidebar ${menuAbierto ? "activo" : ""}`}> 
        <div className="perfil">
          <img src="/Imagenes/perfil.png" alt="Perfil" />
          <h3>{nombre ? nombre : "..."}</h3>
          <p>UsuarioQ@hotmail.com</p>
        </div>

        <ul className="barra-menu">
          <li className={activo === "home" ? "activo" : ""}
          onClick={()=>setActivo("home")} >
            <FaHome className="icono"/> Home </li>
          <li className={activo === "calculadora" ? "activo" : ""}
          onClick={()=>setActivo("calculadora")}>
            <FaCalculator className="icono"/> Calculadora</li>
          <li className={activo === "calendario" ? "activo" : ""}
          onClick={()=>setActivo("calendario")}>
            <FaCalendar className="icono"/> Calendario</li>
          <li className={activo === "ubicacion" ? "activo" : ""}
          onClick={()=>setActivo("ubicacion")}>
            <FaMapMarkerAlt className="icono"/> Ubicación</li>
          <li className={activo === "estadisticas" ? "activo" : ""}
          onClick={()=>setActivo("estadisticas")}>
            <FaChartBar className="icono"/> Estadísticas generales</li>

        </ul>
      </div>
    </>
  );
}
