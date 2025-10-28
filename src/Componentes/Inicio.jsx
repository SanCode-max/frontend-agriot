import React, { useEffect, useState } from "react";
import "../css componentes/Inicio.css";
import { FaUser, FaRightFromBracket } from "react-icons/fa6";
import InicioSesion from "./InicioSesion";


export default function Inicio() {
  const handleClick = () => {
    alert("Botón de imagen clickeado");
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
  );
}
