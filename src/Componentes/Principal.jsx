import React, { useState } from 'react'
import '../css componentes/Principal.css'
import { Link } from 'react-router-dom';

export default function Principal() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <>
    <header>
      <nav id='menu' className={`navegacion ${menuAbierto ? 'navegacion--abierta' : ''}`}>
        <div className="navegacion__barra">
          <div className='logo'>
            <img src="/Imagenes/LOGO.png" alt="Logo AgrIoT" />
            <span className='nombre'>AGRIOT</span>
          </div>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuAbierto}
            aria-controls="menus-principal"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <span className="nav-toggle__bar" aria-hidden />
            <span className="nav-toggle__bar" aria-hidden />
            <span className="nav-toggle__bar" aria-hidden />
          </button>
        </div>

        <ul id="menus-principal" className='menus-links'>
          <li><a href="#inicio" onClick={cerrarMenu}>Inicio</a></li>
          <li><a href="#sobre-nosotros" onClick={cerrarMenu}>Sobre nosotros</a></li>
          <li><a href="#sensores" onClick={cerrarMenu}>Sensores</a></li>
          <li><a href="#cultivos" onClick={cerrarMenu}>Cultivos</a></li>
          <li><a href="#contacto" onClick={cerrarMenu}>Contacto</a></li>
          <li className="menus-links__cta">
            <Link className='boton' to="/Bienvenida" onClick={cerrarMenu}>Iniciar Sesión</Link>
          </li>
        </ul>
      </nav>
    </header>
    <main id="inicio" className='contenido-principal'>
      <section className='texto-principal'>
        <div className='contenido-img'>
          <h1>AgrIoT: Innovación en Agricultura Inteligente</h1>
          <h3>
            Transformando la agricultura con tecnología avanzada.
            Soluciones basadas en IoT para mejorar la producción de arándanos.
          </h3>
          <button className='boton2'>Conoce más</button>
        </div>
      </section>
      <section className='sabias-que'>
          <div className='img'>
            <img src="/Imagenes/arandanos.png" alt="Cultivo de arándanos" />
          </div>
          <p>¿Sabías que la agricultura de precisión puede aumentar la productividad de los cultivos hasta en un 30%?</p>
      </section>
      <section id="sobre-nosotros" className='sobre-nosotros'>
        <h1>EQUIPO DE TRABAJO</h1>
        <div className='equipo'>
          <div className='integrante'>
            <img src="/Imagenes/paula.png" alt="Foto de Paula Andrea Albornoz Santana" />
            <h3>Paula Andrea Albornoz Santana</h3>
            <p>Estudiante de Ingeniería de Sistemas y Computación</p>
          </div>
          <div className='integrante1'>
              <img src="/Imagenes/santy.png" alt="Foto de David Santiago Torres Nieto" />
              <h3>David Santiago Torres Nieto</h3>
              <p>Estudiante de Ingeniería de Sistemas y Computación</p>
          </div>
        </div>
      </section>
      <section id="sensores" className='sensores'>
        <h1>SENSORES UTILIZADOS</h1>
        <div className='sensores-contenido'>
          <div className='sensor-npk'>
            <h2>NPK</h2>
            <img src="/Imagenes/npk.png" alt="Ilustración del sensor NPK" />
            <p>El sensor NPK mide los niveles de nitrógeno (N), fósforo (P) y potasio (K) en el suelo.</p>
          </div>
          <div className='sensor-ph'>
            <h2>PH</h2>
            <img src="/Imagenes/ph.png" alt="Ilustración del sensor de pH" />
            <p>El sensor de pH mide la acidez o alcalinidad del suelo, lo cual es crucial para la salud de las plantas.</p>
          </div>  
          <div className='flotador'>
            <h2>Flotador</h2> 
            <img src="/Imagenes/flotador.png" alt="Ilustración del sensor flotador" />
            <p>Es el encargado de detectar el nivel del de liquido dentro de un tanque o recipiente</p>
          </div>
        </div>
        <button className='boton3'>Conocer más</button>
      </section>
      <section id="cultivos" className='cultivos'>
        <div className='cultivos-contenido'>
          <div className='cultivo1'>
            <div className='cultivo-texto'>
              <h2>FINCA LA HUACA</h2>
              <p>En la finca “La Guaca”, ubicada en la vereda Soaga, municipio de Ubaté (Cundinamarca), se desarrolla un cultivo de arándanos compuesto por aproximadamente 200 arbustos. El sistema productivo implementa riego por goteo, lo que garantiza un suministro eficiente y controlado de agua. Además, el cultivo se encuentra protegido con un plástico de cobertura, medida destinada a mitigar los efectos de los cambios climáticos y preservar la calidad de la producción.</p>
              <div className='botones-cultivo'>
                <button className='boton4'>Acerca del cultivo</button>
              </div>
            </div>
            <div className='cultivo-imagen'>
            <img src="/Imagenes/laguaca.webp" alt="Vista del cultivo en la finca La Huaca" />
            </div>
          </div>
        </div>

      </section>
    </main>
    <footer id="contacto" className='footer'>
      <div className='pie-contenido'>
        <div className='que-somos'>
          <h3>¿Que hacemos?</h3>
          <p>Nos encargamos de ralizar monitoreos en los cultivos de arandanos 
          para optimizar la producción, el uso de recursos y garantizar la calidad del producto.</p>
        </div>
        <div className='redes'>
          <h3>Redes Sociales</h3>
          <div className='iconos'>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <img src="/Imagenes/facebook.png" alt="" /> Facebook
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/Imagenes/instagram.png" alt="" /> Instagram
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src="/Imagenes/gorjeo.png" alt="" /> Twitter
            </a>
          </div>
        </div>
        <div className='contacto'>
          <h3>Contacto</h3>
          <p>"Convierte tus datos en crecimiento: haz tu cultivo más rentable y sostenible."</p>
          <p><span>Email:</span> AgrIoTPT@gmail.com</p>
          <p><span>Teléfono: </span>325483534</p>   
        </div>   
      </div>   
    </footer>
    </>
  );
}

