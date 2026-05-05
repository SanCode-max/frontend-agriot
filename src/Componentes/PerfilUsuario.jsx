import React, { useEffect, useState } from 'react';
import '../css componentes/perfilUsuario.css';
import { Mail, Phone, MapPin, Edit3, X, LocateFixed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

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

    apiFetch(`/perfil/${usuario.correo}`)
      .then(res => {
        if (!res.ok) throw new Error("Error cargando perfil");
        return res.json();
      })
      .then(data => {
        setPerfil(data);

        setNombre(data.nombre || "");
        setTelefono(data.telefono || "");
        setUbicacion(data.ubicacion || "");
        setProfesion(data.profesion || "");
        if (data.latitud) setLatitud(data.latitud);
        if (data.longitud) setLongitud(data.longitud);
      })
      .catch(err => console.error(err));

  }, [navigate]);

  // OBTENER UBICACIÓN AUTOMÁTICA
  const obtenerUbicacionActual = () => {
    if (!navigator.geolocation) {
      setMensaje("Tu navegador no permite geolocalización");
      setTipoMensaje("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitud(lat);
        setLongitud(lng);

        try {
          // Convertir coordenadas a dirección real
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          const data = await response.json();

          const direccion =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.display_name;

          setUbicacion(direccion);

          setMensaje("Ubicación detectada correctamente");
          setTipoMensaje("exito");

        } catch (error) {
          setUbicacion(`Lat: ${lat}, Lon: ${lng}`);
          setMensaje("Ubicación obtenida, pero no se pudo traducir");
          setTipoMensaje("error");
        }

        setTimeout(() => setMensaje(""), 3000);
      },
      () => {
        setMensaje("No se pudo obtener tu ubicación");
        setTipoMensaje("error");
      }
    );
  };

  // Guardar cambios
  const guardarCambios = async (e) => {
    e.preventDefault();

    try {

        // SUBIR FOTO SI EXISTE
        if (fotoArchivo) {
        const formData = new FormData();
        formData.append("foto", fotoArchivo);

        const subidaFoto = await apiFetch(
            `/perfil/foto/${perfil.correo}`,
            {
            method: "POST",
            body: formData
            }
        );

        const fotoData = await subidaFoto.json();

        if (subidaFoto.ok) {
            setPerfil(prev => ({
            ...prev,
            foto: fotoData.foto
            }));
        }
        }

        // ACTUALIZAR DATOS
        const response = await apiFetch(`/perfil/${perfil.correo}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre,
            telefono,
            ubicacion,
            profesion,
            latitud,
            longitud
        })
        });

        const data = await response.json();

        if (response.ok) {
        setPerfil(prev => ({
            ...prev,
            nombre,
            telefono,
            ubicacion,
            profesion,
            latitud,
            longitud
        }));

        setMensaje("Perfil actualizado correctamente");
        setTipoMensaje("exito");

        setTimeout(() => {
            setModoEdicion(false);
            setMensaje("");
        }, 1500);

        } else {
        setMensaje(data.detail || "Error al actualizar");
        setTipoMensaje("error");
        }

    } catch (error) {
        setMensaje("No se pudo conectar con el servidor");
        setTipoMensaje("error");
    }
    };

  if (!perfil) return <div className="loader">Cargando perfil...</div>;

  return (
    <div className="perfil-container">

      {/* HEADER */}
      <div className="perfil-header">
        <div className="foto-wrapper">
          <img src={perfil.foto ? `${perfil.foto}?t=${new Date().getTime()}` : "/avatar-placeholder.jpg"} alt="Foto de perfil"/>
        </div>
        <div className="header-info">
          <h1>{perfil.nombre}</h1>
          <p>{perfil.profesion}</p>
        </div>
      </div>

      <div className="perfil-content">

        {/* INFORMACIÓN PERSONAL */}
        <div className="columna-info">
          <h2>Información personal</h2>

          <div className="item-info">
            <Mail size={20} />
            <span>{perfil.correo}</span>
          </div>

          <div className="item-info">
            <Phone size={20} />
            <span>{perfil.telefono}</span>
          </div>

          <div className="item-info">
            <MapPin size={20} />
            <span>{perfil.ubicacion}</span>
          </div>

          <button
            className="btn-editar"
            onClick={() => setModoEdicion(true)}
          >
            <Edit3 size={18} />
            Editar perfil
          </button>
        </div>

        {/* ACTIVIDAD */}
        <div className="columna-actividad">
          <h2>Actividad</h2>

          <div className="actividad-grid">
            <div className="stats-text">
              <p>Última sesión<br /><strong>{perfil.ultima_sesion || "Hoy"}</strong></p>
              <p>Proyectos asignados<br /><strong>{perfil.proyectos_asignados}</strong></p>
              <p><strong>{perfil.cultivos_seguimiento}</strong> cultivos en seguimiento</p>
            </div>

            <div className="stats-grafico">
              <div
                className="circulo-progreso"
                style={{
                  background: `conic-gradient(#2F5D50 ${perfil.estabilidad}%, #d9d9d9 0%)`
                }}
              >
                <span className="porcentaje">{perfil.estabilidad}%</span>
              </div>
              <p>Estabilidad de los cultivos</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDITAR PERFIL */}
      {modoEdicion && (
        <div className="modal-overlay">
          <div className="modal-editar">

            <button
              className="cerrar-modal"
              onClick={() => setModoEdicion(false)}
            >
              <X size={22} />
            </button>

            <h2>Editar Perfil</h2>

            <form onSubmit={guardarCambios}>
              <input
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />

              <input
                type="text"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />

              <div className="ubicacion-auto">
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                />

                <button
                  type="button"
                  className="gps-btn"
                  onClick={obtenerUbicacionActual}
                >
                  <LocateFixed size={18} />
                  Usar mi ubicación
                </button>
              </div>

              <input
                type="text"
                placeholder="Profesión"
                value={profesion}
                onChange={(e) => setProfesion(e.target.value)}
              />
              <div className="contenedor-foto-upload">
                <label htmlFor="input-foto" className="btn-archivo-personalizado">
                    {fotoArchivo ? "Cambiar imagen seleccionada" : "Seleccionar foto de perfil"}
                </label>
                <input
                    id="input-foto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFotoArchivo(e.target.files[0])}
                    style={{ display: 'none' }} // Oculta el "Choose File" en inglés
                />
                
                {fotoArchivo && (
                    <div className="vista-previa-container">
                    <img
                        src={URL.createObjectURL(fotoArchivo)}
                        alt="Vista previa"
                        className="preview-foto"
                    />
                    <p className="nombre-archivo-txt">{fotoArchivo.name}</p>
                    </div>
                )}
                </div>

              {mensaje && (
                <div className={`mensaje ${tipoMensaje}`}>
                  {mensaje}
                </div>
              )}

              <button type="submit" className="guardar-btn">
                Guardar Cambios
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default PerfilUsuario;