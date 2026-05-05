import React, { useEffect, useState } from "react";
import "../css componentes/Inicio.css";
import { FaUser, FaRightFromBracket } from "react-icons/fa6";
import { FaHome, FaCalculator, FaCalendar, FaMapMarkerAlt, FaChartBar, FaBell, FaPlusCircle } from "react-icons/fa";
import Calculadora from "./Calculadora";
import Perfil from "./PerfilUsuario";
import MapaCultivos from "./MapaCultivos";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/apiClient";

export default function Inicio() {
  const navigate = useNavigate();
  const [activo, setActivo] = useState("home");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cultivos, setCultivos] = useState([]);
  const [nombreCultivo, setNombreCultivo] = React.useState('');
  const [fechaSiembra, setFechaSiembra] = React.useState('');
  const [fechaCosecha, setFechaCosecha] = React.useState('');
  const [estado, setEstado] = React.useState('');
  const [ubicacion, setUbicacion] = React.useState('');
  const [observaciones, setObservaciones] = React.useState('');
  const [mensaje, setMensaje] = React.useState('');
  const [tipoMensaje, setTipoMensaje] = React.useState('');
  const [mostrar, setMostrar] = React.useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [foto, setFoto] = useState("");
  const [sugerenciasUbicacion, setSugerenciasUbicacion] = useState([]);
  const [latitudCultivo, setLatitudCultivo] = useState("");
  const [longitudCultivo, setLongitudCultivo] = useState("");

  const handleClick = () => {
    setMenuAbierto(!menuAbierto);
  };

  const buscarUbicacion = async (texto) => {
    setUbicacion(texto);

    if (texto.length < 3) {
      setSugerenciasUbicacion([]);
      return;
    }
  

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${texto}, Colombia&addressdetails=1&limit=5`
      );

      const data = await response.json();
      console.log("Resultados:", data);
      setSugerenciasUbicacion(data);

    } catch (error) {
      console.error("Error buscando ubicación:", error);
    }
  };

  //Cerrar sesion automaticamente despues de 5 minutos de inactividad
  useEffect(() => {
    let temporizador;

    const cerrarSesionPorInactividad = () => {
      localStorage.removeItem("usuario");
      alert("Sesión cerrada por inactividad");
      navigate("/");
    };

    const reiniciarTemporizador = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(cerrarSesionPorInactividad, 300000); // 5 minutos
    };

    // Eventos que detectan actividad
    window.addEventListener("mousemove", reiniciarTemporizador);
    window.addEventListener("keydown", reiniciarTemporizador);
    window.addEventListener("click", reiniciarTemporizador);
    window.addEventListener("scroll", reiniciarTemporizador);

    // Iniciar conteo al cargar
    reiniciarTemporizador();

    return () => {
      clearTimeout(temporizador);

      window.removeEventListener("mousemove", reiniciarTemporizador);
      window.removeEventListener("keydown", reiniciarTemporizador);
      window.removeEventListener("click", reiniciarTemporizador);
      window.removeEventListener("scroll", reiniciarTemporizador);
    };
  }, []);

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;

    if (usuario && usuario.correo) {

      apiFetch(`/cultivos/${usuario.correo}`)
        .then((response) => response.json())
        .then((data) => {
          setCorreo(usuario.correo);
          setNombre(data.nombre);
          setCultivos(data.cultivos);
        })
        .catch((error) => {
          console.error("Error al obtener los cultivos:", error);
        });
      apiFetch(`/perfil/${usuario.correo}`)
      .then((response) => response.json())
      .then((data) => {
        setCorreo(usuario.correo);
        setNombre(data.nombre);
        setFoto(data.foto || "");
      })
      .catch((error) => {
        console.error("Error al obtener perfil:", error);
      });

    } else {
      navigate("/");
    }
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };
  const handleAgregarCultivo = () => {
    setMostrarFormulario(true);
  }

  //Guardar cultivo

  const hadleGuardarCultivo = async (e) => {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!nombreCultivo || !fechaSiembra || !ubicacion || !observaciones ) {
      setMensaje(' ⚠️ Por favor, complete todos los campos.');
      setTipoMensaje('error');
      setMostrar(true);
      setTimeout (() => setMostrar(false),4000)
      return;
    }

    try {
      const response = await apiFetch("/cultivos", {
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
          ubicacion: ubicacion,
          observaciones: observaciones,
          latitud: latitudCultivo,
          longitud: longitudCultivo
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
          ubicacion: ubicacion,
          observaciones: observaciones
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
        setObservaciones('');
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

    const response = await apiFetch(
      `/cultivos/${usuario.correo}/${id}`,
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
    if (!cosecha) return 0;

    const hoy = new Date();
    const fechaSiembra = new Date(siembra);
    const fechaCosecha = new Date(cosecha);

    if (isNaN(fechaCosecha)) return 0;

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
            <button type="button" aria-label="Notificaciones">
              <FaBell className="icon" />
            </button>
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
                    <input type="text" placeholder="Nombre del cultivo *" value={nombreCultivo} onChange={(e) => setNombreCultivo(e.target.value)} required/>
                    <h1>Fecha de siembra *</h1>
                    <input type="date" placeholder="Fecha de siembra *" value={fechaSiembra} onChange={(e) => setFechaSiembra(e.target.value)} required/>
                    <h1>Fecha estimada de cosecha (Opcional)</h1>
                    <input type="date" value={fechaCosecha} onChange={(e) => setFechaCosecha(e.target.value)} />
                    <select value={estado} onChange={(e) => setEstado(e.target.value)} required>
                      <option value="">Seleccionar estado</option>
                      <option value="Sembrado">Siembra</option>
                      <option value="Crecimiento">Crecimiento</option>
                      <option value="Cosechado">Cosecha</option>
                      <option value="problema">Problema/secado</option>
                    </select>
                    <div className="ubicacion-autocomplete">
                      <input
                        type="text"
                        placeholder="Ubicación del cultivo"
                        value={ubicacion}
                        onChange={(e) => buscarUbicacion(e.target.value)}
                      />
                      {sugerenciasUbicacion.length > 0 && (
                        <ul className="lista-sugerencias">
                          {sugerenciasUbicacion.map((lugar, index) => (
                            <li
                              key={index}
                              onClick={() => {
                                setUbicacion(lugar.display_name);
                                setLatitudCultivo(lugar.lat);
                                setLongitudCultivo(lugar.lon);
                                setSugerenciasUbicacion([]);
                              }}
                            >
                              {lugar.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <textarea
                      placeholder="Observaciones"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />
                    <div className="botones-formulario">
                      <button type="button" onClick={hadleGuardarCultivo }>Guardar Cultivo</button>
                      {mostrar && (
                        <div className={`mensaje ${tipoMensaje}`}>
                          {mensaje}
                        </div>
                      )}
                      <button type="button" onClick={() => {
                        setMostrarFormulario(false);
                        setSugerenciasUbicacion([]);
                      }}>
                        Cancelar
                      </button>
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
                    <p>Observaciones: {cultivo.observaciones}</p>
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

        {activo === "ubicacion" && (
          <div className="contenido-ubicacion">
            <h1>Mapa de Cultivos</h1>

            <div className="leyenda-mapa">
              <span>🟢 Crecimiento</span>
              <span>🟡 Cosecha</span>
              <span>🔴 Problema / Secado</span>
              <span>🔵 Sembrado</span>
            </div>

            <MapaCultivos />
          </div>
        )}
      </main>
      {menuAbierto && (
        <div className="overlay" onClick={() => setMenuAbierto(false)}></div>
      )}
      <div className= {`sidebar ${menuAbierto ? "activo" : ""}`}> 
        <div className="perfil">
          <img src={foto ? `${foto}?t=${new Date().getTime()}` : "/avatar-placeholder.jpg"} alt="Foto de perfil"/>
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

