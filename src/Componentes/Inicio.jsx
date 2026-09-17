import React, { useEffect, useState } from "react";
import "../css componentes/Inicio.css";
// Iconos de Font Awesome 5
import { FaUser, FaBell, FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaSeedling, FaTrash, FaCalculator, FaChartBar, FaHome } from "react-icons/fa";
// Icono de Font Awesome 6
import { FaRightFromBracket } from "react-icons/fa6";
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
  const [nombreCultivo, setNombreCultivo] = useState('');
  const [fechaSiembra, setFechaSiembra] = useState('');
  const [fechaCosecha, setFechaCosecha] = useState('');
  const [estado, setEstado] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [foto, setFoto] = useState("");
  const [sugerenciasUbicacion, setSugerenciasUbicacion] = useState([]);
  const [latitudCultivo, setLatitudCultivo] = useState("");
  const [longitudCultivo, setLongitudCultivo] = useState("");

  const handleClickMenu = () => {
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
  }, [navigate]);

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;

    if (usuario && usuario.correo) {
      // 1. Asignar de inmediato los datos almacenados localmente en el inicio de sesión
      setCorreo(usuario.correo);
      if (usuario.nombre) {
        setNombre(usuario.nombre);
      }

      // 2. Sincronizar cultivos desde el backend
      apiFetch(`/cultivos/${usuario.correo}`)
        .then((response) => response.json())
        .then((data) => {
          // Preserva el nombre del usuario si la API de cultivos no lo trae explícitamente
          if (data.nombre) setNombre(data.nombre);
          setCultivos(data.cultivos || []);
        })
        .catch((error) => {
          console.error("Error al obtener los cultivos:", error);
        });

      // 3. Obtener foto e información actualizada del perfil
      apiFetch(`/perfil/${usuario.correo}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.nombre) setNombre(data.nombre);
          setFoto(data.foto || "");
        })
        .catch((error) => {
          console.error("Error al obtener perfil:", error);
        });

    } else {
      navigate("/");
    }
  }, [navigate]);

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

  const obtenerEstadoClase = (estado) => {
    switch (estado) {
      case 'Sembrado': return 'estado-sembrado';
      case 'Crecimiento': return 'estado-crecimiento';
      case 'Cosechado': return 'estado-cosechado';
      case 'problema': return 'estado-problema';
      default: return '';
    }
  }

  const menuItems = [
    { id: "home", label: "Inicio", icon: FaHome },
    { id: "calculadora", label: "Calculadora", icon: FaCalculator },
    { id: "ubicacion", label: "Mapas", icon: FaMapMarkerAlt },
    { id: "informacion", label: "Mi Perfil", icon: FaUser },
    { id: "estadisticas", label: "Reportes", icon: FaChartBar },
  ];

  return (
    <div className="dashboard-root">
      {/* ---------- SIDEBAR PROFESIONAL ---------- */}
      <aside className={`sidebar-main ${menuAbierto ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <FaSeedling className="logo-icon" />
          <span className="logo-text">Agr<span className="accent">iot</span></span>
        </div>

        <div className="sidebar-profile">
          <div className="avatar-wrapper">
            <img 
              src={foto ? `${foto}?t=${new Date().getTime()}` : "/avatar-placeholder.jpg"} 
              alt="Perfil"
              className="profile-avatar"
            />
          </div>
          <div className="profile-info">
            <h3>{nombre || "Usuario"}</h3>
            <p>{correo || "..."}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map(item => (
              <li 
                key={item.id}
                className={`nav-item ${activo === item.id ? "nav-item-active" : ""}`}
                onClick={() => {
                  setActivo(item.id);
                  setMenuAbierto(false);
                }}
              >
                <item.icon className="nav-icon" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* ---------- ÁREA DE CONTENIDO PRINCIPAL ---------- */}
      <div className="main-panel">
        <header className="main-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={handleClickMenu} aria-label="Abrir menú">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </button>
            <h1>Bienvenido, {nombre ? nombre : "Agricultor"}! 👋</h1>
          </div>
          
          <div className="header-right">
            <button className="icon-btn" aria-label="Notificaciones">
              <FaBell className="header-icon" />
              <span className="notification-badge">3</span>
            </button>
            <button className="btn-logout-header" onClick={handleCerrarSesion}>
              <FaRightFromBracket className="header-icon" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        <main className="content-area">
          {activo === "home" && (
            <div className="home-dashboard">
              <div className="home-header">
                <div>
                  <h2 className="content-title">Panel General de Cultivos</h2>
                  <p className="content-subtitle">Gestiona y monitorea el progreso de tus siembras en tiempo real.</p>
                </div>
                <button className="btn-add-crop" onClick={handleAgregarCultivo}>
                  <FaPlus className="icon-plus" />Nuevo Cultivo
                </button>
              </div>

              {mostrarFormulario && (
                <div className="modal-overlay">
                  <div className="modal-content glass-form">
                    <header className="modal-header">
                      <h3>Registrar Nuevo Cultivo</h3>
                      <button className="btn-close-modal" onClick={() => setMostrarFormulario(false)}>×</button>
                    </header>
                    
                    <form className="crop-form" onSubmit={hadleGuardarCultivo}>
                      <div className="form-group">
                        <input type="text" placeholder="Nombre descriptivo (ej: Arándanos Norte)" value={nombreCultivo} onChange={(e) => setNombreCultivo(e.target.value)} required />
                      </div>
                      
                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Fecha de Siembra *</label>
                          <input type="date" value={fechaSiembra} onChange={(e) => setFechaSiembra(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Fecha Estimada Cosecha</label>
                          <input type="date" value={fechaCosecha} onChange={(e) => setFechaCosecha(e.target.value)} />
                        </div>
                      </div>

                      <div className="form-group">
                        <select value={estado} onChange={(e) => setEstado(e.target.value)} required>
                          <option value="">Seleccionar estado actual...</option>
                          <option value="Sembrado">🌱 Sembrado</option>
                          <option value="Crecimiento">🌿 En Crecimiento</option>
                          <option value="Cosechado">🍇 Listo para Cosecha</option>
                          <option value="problema">⚠️ Problema / Secado</option>
                        </select>
                      </div>

                      <div className="form-group ubicacion-autocomplete">
                        <FaMapMarkerAlt className="icon-input" />
                        <input
                          type="text"
                          placeholder="Ubicación del cultivo"
                          value={ubicacion}
                          onChange={(e) => buscarUbicacion(e.target.value)}
                        />
                        {sugerenciasUbicacion.length > 0 && (
                          <ul className="suggestions-list">
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

                      <div className="form-group">
                        <textarea placeholder="Notas u observaciones adicionales..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows="3"></textarea>
                      </div>

                      <footer className="form-footer">
                        {mostrar && <div className={`form-message ${tipoMensaje}`}>{mensaje}</div>}
                        <div className="form-actions">
                          <button type="button" className="btn-cancel" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                          <button type="submit" className="btn-submit">Guardar Cultivo</button>
                        </div>
                      </footer>
                    </form>
                  </div>
                </div>
              )}

              <div className="crops-grid">
                {cultivos.map((cultivo) => {
                  const progreso = calcularProgreso(cultivo.fechaSiembra, cultivo.fechaCosecha);
                  return (
                    <article key={cultivo.id} className="crop-card reveal-delay">
                      <header className="card-header">
                        <h3>{cultivo.nombre}</h3>
                        <span className={`status-pill ${obtenerEstadoClase(cultivo.estado)}`}>{cultivo.estado}</span>
                      </header>
                      
                      <div className="card-body">
                        <div className="info-item">
                          <FaCalendarAlt className="card-icon" /> <span><b>Siembra:</b> {cultivo.fechaSiembra}</span>
                        </div>
                        {cultivo.fechaCosecha && (
                          <div className="info-item">
                            <FaCalendarAlt className="card-icon" /> <span><b>Cosecha:</b> {cultivo.fechaCosecha}</span>
                          </div>
                        )}
                        <div className="info-item location">
                          <FaMapMarkerAlt className="card-icon" /> <span>{cultivo.ubicacion}</span>
                        </div>
                      </div>

                      <div className="progress-section">
                        <div className="progress-label">
                          <span>Progreso de crecimiento</span>
                          <span>{progreso}%</span>
                        </div>
                        <div className="modern-progress-bar">
                          <div className="progress-fill" style={{ width: `${progreso}%` }}></div>
                        </div>
                      </div>

                      <footer className="card-footer">
                        <button className="btn-delete-card" onClick={() => eliminarCultivo(cultivo.id)} aria-label="Eliminar cultivo">
                          <FaTrash />
                        </button>
                        <button className="btn-details-card">Ver Detalles</button>
                      </footer>
                    </article>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. VISTA CALCULADORA */}
          {activo === "calculadora" && <Calculadora />}

          {/* 3. VISTA MAPAS */}
          {activo === "ubicacion" && <MapaCultivos />}

          {/* 4. VISTA MI PERFIL */}
          {activo === "informacion" && <Perfil />}

          {/* 5. VISTA REPORTES / ESTADÍSTICAS */}
          {activo === "estadisticas" && (
            <div className="seccion-placeholder">
              <h2>Reportes y Estadísticas</h2>
              <p>Módulo de analítica en desarrollo...</p>
            </div>
          )}
        </main>
      </div>

      {/* Overlay de la sidebar móvil */}
      {menuAbierto && (
        <div className="sidebar-overlay-mobile" onClick={() => setMenuAbierto(false)}></div>
      )}
    </div>
  );
}