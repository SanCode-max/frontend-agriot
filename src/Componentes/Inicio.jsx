import React, { useEffect, useState } from "react";
import "../css componentes/Inicio.css";
// Iconos de Font Awesome 5
import { FaUser, FaBell, FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaSeedling, FaCalculator, FaChartBar, FaHome, FaUserPlus } from "react-icons/fa";
// Icono de Font Awesome 6
import { FaRightFromBracket } from "react-icons/fa6";
import Calculadora from "./Calculadora";
import Perfil from "./PerfilUsuario";
import MapaCultivos from "./MapaCultivos";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/apiClient";
import CrearUsuario from "./CrearUsuario";

const esRolAdministrador = (rol) => ["admin", "administrador", "administrator"].includes(String(rol || "").toLowerCase());
const esGestorCultivos = (rol) => esRolAdministrador(rol) || String(rol || "").toLowerCase() === "asistente";

export default function Inicio() {
  const navigate = useNavigate();
  const [activo, setActivo] = useState("home");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardandoCultivo, setGuardandoCultivo] = useState(false);
  const [cultivos, setCultivos] = useState([]);
  const [nombreCultivo, setNombreCultivo] = useState('');
  const [variedadCultivo, setVariedadCultivo] = useState('Arándano');
  const [fechaSiembra, setFechaSiembra] = useState('');
  const [fechaCosecha, setFechaCosecha] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [usuarioAsignado, setUsuarioAsignado] = useState('');
  const [usuariosAsignables, setUsuariosAsignables] = useState([]);
  const [estado, setEstado] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [foto, setFoto] = useState("");
  const [sugerenciasUbicacion, setSugerenciasUbicacion] = useState([]);

  const handleClickMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const buscarUbicacion = async (texto) => {
    setUbicacion(texto);
    setLatitud('');
    setLongitud('');

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
      apiFetch('/logout', { method: 'POST' }).catch(() => {});
      localStorage.removeItem("token");
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

      // Cultivos: el backend filtra por la sesión para operarios.
      apiFetch('/cultivos')
        .then((response) => response.json())
        .then((data) => {
          setCultivos((data.cultivos || []).map((crop) => ({
            ...crop,
            fechaSiembra: crop.fecha_siembra || crop.fechaSiembra,
            fechaCosecha: crop.fecha_estimada_cosecha || crop.fecha_cosecha || crop.fechaCosecha,
            estado: crop.estado_actual || crop.estado,
          })));
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

  useEffect(() => {
    if (!mostrarFormulario) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mostrarFormulario]);

  useEffect(() => {
    if (!mostrarFormulario || !esGestorCultivos(JSON.parse(localStorage.getItem("usuario") || "{}").rol)) return;
    apiFetch('/admin/usuarios').then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'No se pudieron cargar los usuarios.');
      setUsuariosAsignables(data.usuarios || []);
      if (data.usuarios?.length) setUsuarioAsignado(String(data.usuarios[0].id));
    }).catch((error) => {
      setMensaje(error.message);
      setTipoMensaje('error');
      setMostrar(true);
    });
  }, [mostrarFormulario]);

  const handleCerrarSesion = () => {
    apiFetch('/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };
  const handleAgregarCultivo = () => {
    setMostrarFormulario(true);
  }

  //Guardar cultivo

  const hadleGuardarCultivo = async (e) => {
    e.preventDefault();
    if (guardandoCultivo) return;
    if (!nombreCultivo || !fechaSiembra || !ubicacion || !deviceId || !usuarioAsignado) {
      setMensaje(' ⚠️ Por favor, complete todos los campos.');
      setTipoMensaje('error');
      setMostrar(true);
      setTimeout (() => setMostrar(false),4000)
      return;
    }

    setGuardandoCultivo(true);
    try {
      const response = await apiFetch("/cultivos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombreCultivo,
          variedad: variedadCultivo,
          user_id: Number(usuarioAsignado),
          device_id: deviceId,
          fecha_siembra: fechaSiembra,
          fecha_estimada_cosecha: fechaCosecha || null,
          estado_actual: estado,
          ubicacion: ubicacion,
          observaciones: observaciones,
          latitud: latitud === '' ? null : Number(latitud),
          longitud: longitud === '' ? null : Number(longitud),
        }),                
      });
      const data = await response.json();

      if (response.ok){

        const crop = data.cultivo;
        const nuevoCultivo = { ...crop, fechaSiembra: crop.fecha_siembra, fechaCosecha: crop.fecha_estimada_cosecha, estado: crop.estado_actual };
        setMensaje(data.mensaje || "Cultivo registrado correctamente");
        setTipoMensaje("exito");
        setCultivos((previous) => [nuevoCultivo, ...previous]);
        setMostrarFormulario(false);
        setNombreCultivo('');
        setVariedadCultivo('Arándano');
        setFechaSiembra('');
        setFechaCosecha('');
        setDeviceId('');
        setLatitud('');
        setLongitud('');
        setUsuarioAsignado('');
        setEstado('');
        setUbicacion('');
        setObservaciones('');
        setMostrar(true);
        setTimeout (() => setMostrar(false), 4000);
      }else {
        setMensaje(data.detail || Object.values(data.errors || {}).flat()[0] || "Ocurrió un error en el registro");
        setTipoMensaje("error")
        setMostrar(true);
        setTimeout (() => setMostrar(false), 4000);
      }
    }catch (error) {
      setMensaje("No se pudo conectar con el servidor");
      setTipoMensaje("error");
      setMostrar(true);
      setTimeout (() => setMostrar(false),4000)
    } finally {
      setGuardandoCultivo(false);
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
      case 'Vegetativo': return 'estado-crecimiento';
      case 'Floración': return 'estado-sembrado';
      case 'Fructificación': return 'estado-crecimiento';
      case 'Cosecha': return 'estado-cosechado';
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
    ...(esRolAdministrador(JSON.parse(localStorage.getItem("usuario") || "{}")?.rol)
      ? [{ id: "usuarios", label: "Crear Operario", icon: FaUserPlus }]
      : []),
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
                {esGestorCultivos(JSON.parse(localStorage.getItem("usuario") || "{}").rol) && (
                  <button className="btn-add-crop" onClick={handleAgregarCultivo}>
                    <FaPlus className="icon-plus" />Nuevo Cultivo
                  </button>
                )}
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

                      <div className="form-group">
                        <label>Variedad de arándano</label>
                        <input type="text" placeholder="Ej: Biloxi" value={variedadCultivo} onChange={(e) => setVariedadCultivo(e.target.value)} maxLength="120" />
                      </div>

                      <div className="form-group">
                        <label>Usuario operario asignado *</label>
                        <select value={usuarioAsignado} onChange={(e) => setUsuarioAsignado(e.target.value)} required disabled={!usuariosAsignables.length}>
                          <option value="">{usuariosAsignables.length ? 'Seleccionar operario...' : 'No hay operarios disponibles'}</option>
                          {usuariosAsignables.map((operario) => <option key={operario.id} value={operario.id}>{operario.nombre} {operario.apellido} · {operario.correo}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>ID del Nodo IoT / ESP32 *</label>
                        <input type="text" placeholder="Ej: ESP32-CAM-NORTE-01" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} maxLength="120" required />
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
                          <option value="Vegetativo">🌱 Vegetativo</option>
                          <option value="Floración">🌼 Floración</option>
                          <option value="Fructificación">🫐 Fructificación</option>
                          <option value="Cosecha">🧺 Cosecha</option>
                          <option value="Descanso">🌿 Descanso</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div className="form-group ubicacion-autocomplete">
                        <FaMapMarkerAlt className="icon-input" />
                        <input
                          type="text"
                          placeholder="Ubicación del cultivo"
                          value={ubicacion}
                          onChange={(e) => buscarUbicacion(e.target.value)}
                          required
                        />
                        {sugerenciasUbicacion.length > 0 && (
                          <ul className="suggestions-list">
                            {sugerenciasUbicacion.map((lugar, index) => (
                              <li
                                key={index}
                                onClick={() => {
                                  setUbicacion(lugar.display_name);
                                  setLatitud(lugar.lat);
                                  setLongitud(lugar.lon);
                                  setSugerenciasUbicacion([]);
                                }}
                              >
                                {lugar.display_name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Latitud</label>
                          <input type="number" step="any" min="-90" max="90" placeholder="5.309" value={latitud} onChange={(e) => setLatitud(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Longitud</label>
                          <input type="number" step="any" min="-180" max="180" placeholder="-73.815" value={longitud} onChange={(e) => setLongitud(e.target.value)} />
                        </div>
                      </div>

                      <div className="form-group">
                        <textarea placeholder="Notas u observaciones adicionales..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows="3"></textarea>
                      </div>

                      <footer className="form-footer">
                        {mostrar && <div className={`form-message ${tipoMensaje}`}>{mensaje}</div>}
                        <div className="form-actions">
                          <button type="button" className="btn-cancel" onClick={() => setMostrarFormulario(false)} disabled={guardandoCultivo}>Cancelar</button>
                          <button type="submit" className="btn-submit" disabled={guardandoCultivo}>{guardandoCultivo ? 'Guardando…' : 'Guardar cultivo'}</button>
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
                    <article key={cultivo.id} className="crop-card reveal-delay crop-card-clickable" role="link" tabIndex={0} onClick={() => navigate(`/cultivos/${cultivo.id}`)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate(`/cultivos/${cultivo.id}`); }}>
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
                        <button className="btn-details-card" onClick={() => navigate(`/cultivos/${cultivo.id}`)}>Abrir monitoreo</button>
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

          {activo === "usuarios" && esRolAdministrador(JSON.parse(localStorage.getItem("usuario") || "{}")?.rol) && (
            <CrearUsuario embedded />
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
