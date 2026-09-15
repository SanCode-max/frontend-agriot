import React, { useState, useEffect } from 'react';
import '../css componentes/Principal.css';
import { Link } from 'react-router-dom';

export default function Principal() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detección de scroll para el Header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animaciones Scroll Reveal (Aparecer información al bajar)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-on-scroll');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    const elementsToAnimate = document.querySelectorAll(
      '.sabias-que-grid, .card-team-member, .sensor-card, .cultivo-card-main, .section-header-modern, .section-title'
    );

    elementsToAnimate.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <div className="agriot-app">
      {/* ---------- ENCABEZADO / NAVBAR FLOTANTE ---------- */}
      <header className={`header-wrapper ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="container">
          <nav className="navbar">
            <div className="navbar-brand">
              <div className="logo-box">
                <img src="/Imagenes/logo_fondo.png" alt="Logo AgrIoT" />
              </div>
              <span className="brand-name">
                AGR<span className="brand-accent">IOT</span>
              </span>
            </div>

            <button
              type="button"
              className={`mobile-toggle ${menuAbierto ? 'is-active' : ''}`}
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Menú de navegación"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <ul className={`nav-menu ${menuAbierto ? 'nav-menu-open' : ''}`}>
              <li><a href="#inicio" className="nav-link active" onClick={cerrarMenu}>Inicio</a></li>
              <li><a href="#sobre-nosotros" className="nav-link" onClick={cerrarMenu}>Sobre nosotros</a></li>
              <li><a href="#sensores" className="nav-link" onClick={cerrarMenu}>Sensores</a></li>
              <li><a href="#cultivos" className="nav-link" onClick={cerrarMenu}>Cultivos</a></li>
              <li><a href="#contacto" className="nav-link" onClick={cerrarMenu}>Contacto</a></li>
              <li className="nav-cta">
                <Link className="btn-login-header" to="/Bienvenida" onClick={cerrarMenu}>
                  <span>Iniciar Sesión</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="inicio" className="contenido-principal">
        {/* ---------- HERO / BANNER PRINCIPAL ---------- */}
        <section className="texto-principal">
          <div className="hero-overlay"></div>
          <div className="container contenido-img">
            <span className="hero-badge">Innovación en IoT Agrícola</span>
            <h1>AgrIoT: Innovación en Agricultura Inteligente</h1>
            <h3>
              Transformando la agricultura con tecnología avanzada.
              Soluciones basadas en IoT para mejorar la producción de arándanos.
            </h3>
            <div className="hero-buttons">
              <a href="#sobre-nosotros" className="boton2">Conoce más</a>
            </div>
          </div>
        </section>

        {/* ---------- SECCIÓN SABÍAS QUÉ ---------- */}
        <section className="sabias-que">
          <div className="container sabias-que-grid">
            <div className="img-container">
              <img src="/Imagenes/arandanos.png" alt="Cultivo de arándanos" />
            </div>
            <div className="sabias-que-info">
              <span className="stat-highlight">+30%</span>
              <p>
                ¿Sabías que la agricultura de precisión puede aumentar la productividad
                de los cultivos hasta en un <strong>30%</strong>?
              </p>
            </div>
          </div>
        </section>

        {/* ---------- EQUIPO DE TRABAJO REDISEÑADO ---------- */}
        <section id="sobre-nosotros" className="sobre-nosotros">
          <div className="container">
            <div className="section-header-modern">
              <span className="section-tag">Talento Humano</span>
              <h2>EQUIPO DE TRABAJO</h2>
              <p>Las mentes detrás de la innovación en agricultura inteligente IoT</p>
            </div>

            <div className="equipo-grid">
              {/* Integrante 1 */}
              <div className="card-team-member">
                <div className="card-glow-bar"></div>
                <div className="avatar-ring">
                  <div className="avatar-img-box">
                    <img src="/Imagenes/paula.png" alt="Foto de Paula Andrea Albornoz Santana" />
                  </div>
                </div>
                <div className="member-info">
                  <h3>Paula Andrea Albornoz Santana</h3>
                  <span className="member-role-badge">Co-Fundadora & Desarrollo</span>
                  <p className="member-career">Estudiante de Ingeniería de Sistemas y Computación</p>
                </div>
              </div>

              {/* Integrante 2 */}
              <div className="card-team-member">
                <div className="card-glow-bar"></div>
                <div className="avatar-ring">
                  <div className="avatar-img-box">
                    <img src="/Imagenes/santy.png" alt="Foto de David Santiago Torres Nieto" />
                  </div>
                </div>
                <div className="member-info">
                  <h3>David Santiago Torres Nieto</h3>
                  <span className="member-role-badge">Co-Fundador & Arquitectura IoT</span>
                  <p className="member-career">Estudiante de Ingeniería de Sistemas y Computación</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- SECCIÓN SENSORES ---------- */}
        <section id="sensores" className="sensores">
          <div className="container">
            <div className="section-title">
              <h2>SENSORES UTILIZADOS</h2>
              <p>Monitoreo continuo y preciso para el óptimo desarrollo de tu cultivo</p>
            </div>
            <div className="sensores-grid">
              <div className="sensor-card">
                <div className="sensor-img-wrapper">
                  <img src="/Imagenes/npk.png" alt="Ilustración del sensor NPK" />
                </div>
                <h2>NPK</h2>
                <p>El sensor NPK mide los niveles de nitrógeno (N), fósforo (P) y potasio (K) en el suelo.</p>
              </div>

              <div className="sensor-card">
                <div className="sensor-img-wrapper">
                  <img src="/Imagenes/ph.png" alt="Ilustración del sensor de pH" />
                </div>
                <h2>PH</h2>
                <p>El sensor de pH mide la acidez o alcalinidad del suelo, lo cual es crucial para la salud de las plantas.</p>
              </div>

              <div className="sensor-card">
                <div className="sensor-img-wrapper">
                  <img src="/Imagenes/flotador.png" alt="Ilustración del sensor flotador" />
                </div>
                <h2>Flotador</h2>
                <p>Es el encargado de detectar el nivel del liquido dentro de un tanque o recipiente.</p>
              </div>
            </div>
            <div className="sensor-cta">
              <button className="boton3">Conocer más</button>
            </div>
          </div>
        </section>

        {/* ---------- SECCIÓN CULTIVOS ---------- */}
        <section id="cultivos" className="cultivos">
          <div className="container">
            <div className="cultivo-card-main">
              <div className="cultivo-texto">
                <span className="badge-cultivo">Ubaté, Cundinamarca</span>
                <h2>FINCA LA HUACA</h2>
                <p>
                  En la finca “La Guaca”, ubicada en la vereda Soaga, municipio de Ubaté (Cundinamarca),
                  se desarrolla un cultivo de arándanos compuesto por aproximadamente 200 arbustos.
                  El sistema productivo implementa riego por goteo, lo que garantiza un suministro
                  eficiente y controlado de agua. Además, el cultivo se encuentra protegido con un
                  plástico de cobertura, medida destinada a mitigar los efectos de los cambios climáticos
                  y preservar la calidad de la producción.
                </p>
                <div className="botones-cultivo">
                  <button className="boton4">Acerca del cultivo</button>
                </div>
              </div>
              <div className="cultivo-imagen">
                <img src="/Imagenes/laguaca.webp" alt="Vista del cultivo en la finca La Huaca" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer id="contacto" className="footer">
        <div className="container pie-contenido">
          <div className="footer-col que-somos">
            <h3>¿Qué hacemos?</h3>
            <p>
              Nos encargamos de realizar monitoreos en los cultivos de arándanos 
              para optimizar la producción, el uso de recursos y garantizar la calidad del producto.
            </p>
          </div>

          <div className="footer-col redes">
            <h3>Redes Sociales</h3>
            <div className="iconos-redes">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <img src="/Imagenes/facebook.png" alt="Facebook" /> Facebook
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <img src="/Imagenes/instagram.png" alt="Instagram" /> Instagram
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <img src="/Imagenes/gorjeo.png" alt="Twitter" /> Twitter
              </a>
            </div>
          </div>

          <div className="footer-col contacto">
            <h3>Contacto</h3>
            <p className="frase-contacto">
              "Convierte tus datos en crecimiento: haz tu cultivo más rentable y sostenible."
            </p>
            <p><span>Email:</span> AgrIoTPT@gmail.com</p>
            <p><span>Teléfono:</span> 325483534</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AgrIoT - Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}