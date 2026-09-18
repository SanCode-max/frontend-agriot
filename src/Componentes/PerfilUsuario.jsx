import React, { useEffect, useState } from 'react';
import '../css componentes/perfilUsuario.css';
import { Mail, Phone, MapPin, Edit3, X, LocateFixed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estados de carga e interacción para los botones
  const [guardando, setGuardando] = useState(false);
  const [buscandoGps, setBuscandoGps] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [profesion, setProfesion] = useState("");
  const [fotoArchivo, setFotoArchivo] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  // Coordenadas GPS
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario || !usuario.correo) {
      navigate("/");
      return;
    }

    // Datos de respaldo local si falla la API
    const perfilRespaldo = {
      nombre: usuario.nombre || "Usuario",
      correo: usuario.correo,
      telefono: usuario.telefono || "Sin registrar",
      ubicacion: "Ubaté, Cundinamarca",
      profesion: "Administrador",
      foto: null,
      ultima_sesion: "Hoy",
      proyectos_asignados: 2,
      cultivos_seguimiento: 3,
      estabilidad: 75
    };

    apiFetch(`/perfil/${usuario.correo}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la información desde el servidor");
        return res.json();
      })
      .then(data => {
        setPerfil(data);
        setNombre(data.nombre_completo || `${data.nombre || ''} ${data.apellido || ''}`.trim() || usuario.nombre || "");
        setTelefono(data.telefono || usuario.telefono || "");
        setUbicacion(data.ubicacion || "");
        setProfesion(data.profesion || "Administrador");
        if (data.latitud) setLatitud(data.latitud);
        if (data.longitud) setLongitud(data.longitud);
      })
      .catch(err => {
        console.error("Error al obtener perfil, usando respaldo local:", err);
        setPerfil(perfilRespaldo);
        setNombre(usuario.nombre || "");
        setTelefono(usuario.telefono || "");
        setProfesion("Administrador");
      })
      .finally(() => {
        setCargando(false);
      });

  }, [navigate]);

  // OBTENER UBICACIÓN AUTOMÁTICA
  const obtenerUbicacionActual = () => {
    if (!navigator.geolocation) {
      setMensaje("Tu navegador no permite geolocalización");
      setTipoMensaje("error");
      return;
    }

    setBuscandoGps(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitud(lat);
        setLongitud(lng);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          const data = await response.json();

          const direccion =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.display_name;

          setUbicacion(direccion);
          setMensaje("Ubicación detectada correctamente");
          setTipoMensaje("exito");

        } catch (error) {
          setUbicacion(`Lat: ${lat}, Lon: ${lng}`);
          setMensaje("Ubicación obtenida, pero no se pudo traducir");
          setTipoMensaje("error");
        } finally {
          setBuscandoGps(false);
          setTimeout(() => setMensaje(""), 3000);
        }
      },
      () => {
        setMensaje("No se pudo obtener tu ubicación");
        setTipoMensaje("error");
        setBuscandoGps(false);
      }
    );
  };

  // GUARDAR CAMBIOS
  const guardarCambios = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const usuarioStorage = JSON.parse(localStorage.getItem("usuario"));
      const correoUsuario = perfil?.correo || usuarioStorage?.correo;
      let urlFotoConfirmada = perfil?.foto;

      // 1. SUBIR FOTO SI EXISTE
      if (fotoArchivo) {
        const formData = new FormData();
        formData.append("foto", fotoArchivo);


        const API_URL = process.env.REACT_APP_API_URL || "https://agriot-backend.onrender.com/api"; 

        // NOTA: Usamos fetch nativo SIN headers manuales para que FormData funcione
        const subidaFoto = await fetch(`${API_URL}/perfil/foto/${encodeURIComponent(correoUsuario)}`, {
          method: "POST",
          body: formData,
        });

        const fotoData = await subidaFoto.json();

        if (subidaFoto.ok && fotoData.foto) {
          urlFotoConfirmada = fotoData.foto;
        } else {
          console.error("Error al subir foto:", fotoData);
        }
      }

      // 2. ACTUALIZAR DATOS DEL PERFIL EN EL BACKEND
      const response = await apiFetch(`/perfil/${encodeURIComponent(correoUsuario)}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre,
          telefono,
          ubicacion,
          profesion,
          latitud,
          longitud,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. ACTUALIZAR ESTADO LOCAL CON LA FOTO CONFIRMADA
        setPerfil((prev) => ({
          ...prev,
          nombre,
          telefono,
          ubicacion,
          profesion,
          latitud,
          longitud,
          foto: urlFotoConfirmada,
        }));

        // Actualizar localStorage para mantener la sincronía del nombre en la app
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            ...usuarioStorage,
            nombre: nombre,
            telefono: telefono,
          })
        );

        setMensaje("Perfil actualizado correctamente");
        setTipoMensaje("exito");

        setTimeout(() => {
          setModoEdicion(false);
          setMensaje("");
          setFotoArchivo(null);
        }, 1200);
      } else {
        setMensaje(data.detail || data.mensaje || "Error al actualizar los datos");
        setTipoMensaje("error");
      }
    } catch (error) {
      console.error("Error en guardarCambios:", error);
      setMensaje("No se pudo conectar con el servidor");
      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="loader">Cargando perfil...</div>;
  if (!perfil) return <div className="loader">No se pudo cargar la información del usuario.</div>;

  return (
    <div className="perfil-container">

      {/* HEADER DE VISTA */}
      <div className="perfil-header">
        <div className="foto-wrapper">
          <img 
            src={perfil.foto ? `${perfil.foto}?t=${new Date().getTime()}` : "/avatar-placeholder.jpg"} 
            alt="Foto de perfil"
          />
        </div>
        <div className="header-info">
          <h1>{perfil.nombre}</h1>
          <p>{perfil.profesion || "Administrador"}</p>
        </div>
      </div>

      <div className="perfil-content">

        {/* INFORMACIÓN PERSONAL */}
        <div className="columna-info">
          <h2>Información personal</h2>

          <div className="item-info">
            <Mail className="icon-info" size={19} />
            <span>{perfil.correo}</span>
          </div>

          <div className="item-info">
            <Phone className="icon-info" size={19} />
            <span>{perfil.telefono}</span>
          </div>

          <div className="item-info">
            <MapPin className="icon-info" size={19} />
            <span>{perfil.ubicacion || "Ubicación no registrada"}</span>
          </div>

          <button
            className="btn-editar"
            onClick={() => setModoEdicion(true)}
          >
            Editar perfil
          </button>
        </div>

        {/* ACTIVIDAD */}
        <div className="columna-actividad">
          <h2>Actividad</h2>

          <div className="actividad-grid">
            <div className="stats-text">
              <div className="stat-block">
                <span className="stat-label">Última sesión</span>
                <span className="stat-value">{perfil.ultima_sesion || "Hoy"}</span>
              </div>

              <div className="stat-block">
                <span className="stat-label">Proyectos asignados</span>
                <span className="stat-value">{perfil.proyectos_asignados || 2}</span>
              </div>

              <div className="stat-block inline-stat">
                <span className="stat-value">{perfil.cultivos_seguimiento || 3}</span>
                <span className="stat-label-inline">cultivos en seguimiento</span>
              </div>
            </div>

            <div className="stats-grafico">
              <div
                className="circulo-progreso"
                style={{
                  background: `conic-gradient(#4caf50 ${perfil.estabilidad || 75}%, #81c784 0%)`
                }}
              >
                <div className="circulo-interior">
                  <span className="porcentaje">{perfil.estabilidad || 75}%</span>
                </div>
              </div>
              <p className="grafico-label">Estabilidad de los cultivos</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDITAR PERFIL */}
      {modoEdicion && (
        <div className="modal-overlay">
          <div className="modal-editar-pro">

            {/* Cabecera del Modal */}
            <div className="modal-header-pro">
              <div>
                <h2>Editar Perfil</h2>
                <p className="modal-subtitulo">Actualiza tus datos personales y ubicación</p>
              </div>
              <button
                className="cerrar-modal-pro"
                onClick={() => setModoEdicion(false)}
                aria-label="Cerrar modal"
                disabled={guardando}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardarCambios} className="form-editar-pro">
              
              {/* Foto de Perfil */}
              <div className="seccion-foto-pro">
                <div className="avatar-upload-wrapper">
                  <img
                    src={
                      fotoArchivo
                        ? URL.createObjectURL(fotoArchivo)
                        : perfil?.foto
                        ? `${perfil.foto}?t=${new Date().getTime()}`
                        : "/avatar-placeholder.jpg"
                    }
                    alt="Vista previa"
                    className="preview-foto-pro"
                  />
                  <label htmlFor="input-foto-pro" className="badge-camara-upload" title="Cambiar foto">
                    <Edit3 size={14} />
                  </label>
                  <input
                    id="input-foto-pro"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFotoArchivo(e.target.files[0])}
                    disabled={guardando}
                    style={{ display: 'none' }}
                  />
                </div>
                <span className="hint-foto">Haz clic en el lápiz para cambiar tu imagen</span>
              </div>

              {/* Campos de Formulario */}
              <div className="grid-campos-pro">
                <div className="campo-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={guardando}
                    required
                  />
                </div>

                <div className="campo-group">
                  <label>Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: 3168015973"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={guardando}
                  />
                </div>

                <div className="campo-group">
                  <label>Profesión / Cargo</label>
                  <input
                    type="text"
                    placeholder="Ej: Administrador"
                    value={profesion}
                    onChange={(e) => setProfesion(e.target.value)}
                    disabled={guardando}
                  />
                </div>

                <div className="campo-group">
                  <label>Ubicación General</label>
                  <div className="ubicacion-auto-pro">
                    <input
                      type="text"
                      placeholder="Ej: Ubaté, Cundinamarca"
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      disabled={guardando || buscandoGps}
                    />
                    <button
                      type="button"
                      className="gps-btn-pro"
                      onClick={obtenerUbicacionActual}
                      disabled={buscandoGps || guardando}
                      title="Detectar por GPS"
                    >
                      <LocateFixed size={16} />
                      <span>{buscandoGps ? "Buscando ubicación..." : "GPS"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensaje de estado */}
              {mensaje && (
                <div className={`mensaje-toast-pro ${tipoMensaje}`}>
                  {mensaje}
                </div>
              )}

              {/* Acciones del Formulario */}
              <div className="modal-acciones-pro">
                <button
                  type="button"
                  className="btn-cancelar-pro"
                  onClick={() => setModoEdicion(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-guardar-pro" 
                  disabled={guardando}
                >
                  {guardando ? "Guardando cambios..." : "Guardar Cambios"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PerfilUsuario;