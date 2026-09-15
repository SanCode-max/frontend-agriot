import React from 'react';
import '../css componentes/PrincipioSesion.css';
import { Link } from 'react-router-dom';

export default function PrincipioSesion() {
  return (
    <main className="contenedor-principal">
      {/* Superposición oscura y elegante para dar contraste */}
      <div className="overlay-fondo"></div>

      {/* Botón flotante para regresar a la página principal */}
      <Link to="/" className="btn-volver-inicio">
        ← Volver al inicio
      </Link>

      <div className="caja-principal">
        <div className="bienvenida">
          {/* Badge corporativo */}
          <span className="badge-portal">Portal AgrIoT</span>

          <h1>BIENVENIDO</h1>
          <p className="subtitulo-portal">Plataforma Inteligente de Monitoreo Agrícola</p>

          <div className="logo-contenedor">
            <img src="/Imagenes/logo_fondo.png" alt="Logo AgrIoT" />
          </div>

          <div className="datos">
            <Link to="/login" className="btn-portal btn-login-primary">
              Iniciar Sesión
            </Link>
            <Link to="/registro" className="btn-portal btn-registro-secondary">
              Registrarse
            </Link>
          </div>

          <footer className="footer-portal">
            <p>Monitoreo IoT para cultivos de precisión</p>
          </footer>
        </div>
      </div>
    </main>
  );
}