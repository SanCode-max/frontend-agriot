import { click } from '@testing-library/user-event/dist/click';
import React from 'react'
import '../css componentes/Principal.css'

export default function component() {
  
  return (
    <>
    <header>
      <nav id='menu' className='navegacion'>
        <div className='logo'>
          <img src="/Imagenes/LOGO.png"/>
          <span className='nombre'>AGRIOT</span>
        </div>      
       
        <ul className='menus-links'>
          <li><a href="#">Inicio</a></li>
          <li><a href="#">Sobre nosotros</a></li>
          <li><a href="#">Sensores</a></li>
          <li><a href="#">Cultivos</a></li>
          <li><a href="#">Contacto</a></li>
          <button className='boton'>Iniciar Sesión</button>
        </ul>
      </nav>
    </header>
    <main className='contenido-principal'>
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
            <img src="/Imagenes/arandanos.png"/>
          </div>
          <p>¿Sabías que la agricultura de precisión puede aumentar la productividad de los cultivos hasta en un 30%?</p>
      </section>
      <section className='sobre-nosotros'>
        <h1>EQUIPO DE TRABAJO</h1>
        <div className='equipo'>
          <div className='integrante'>
            <img src="/Imagenes/paula.png"/>
            <h3>Paula Andrea Albornoz Santana</h3>
            <p>Estudiante de Ingeniería de Sistemas y Computación</p>
          </div>
          <div className='integrante1'>
              <img src="/Imagenes/santy.png"/>
              <h3>David Santiago Torres Nieto</h3>
              <p>Estudiante de Ingeniería de Sistemas y Computación</p>
          </div>
        </div>
      </section>
      <section className='sensores'>
        <h1>SENSORES UTILIZADOS</h1>
        <div className='sensores-contenido'>
          <div className='sensor-npk'>
            <h2>NPK</h2>
            <img src="/Imagenes/npk.png"/>
            <p>El sensor NPK mide los niveles de nitrógeno (N), fósforo (P) y potasio (K) en el suelo.</p>
          </div>
          <div className='sensor-ph'>
            <h2>PH</h2>
            <img src="/Imagenes/ph.png"/>
            <p>El sensor de pH mide la acidez o alcalinidad del suelo, lo cual es crucial para la salud de las plantas.</p>
          </div>  
          <div className='flotador'>
            <h2>Flotador</h2> 
            <img src="/Imagenes/flotador.png"/>
            <p>Es el encargado de detectar el nivel del de liquido dentro de un tanque o recipiente</p>
          </div>
        </div>
        <button className='boton3'>Conocer más</button>
      </section>
      <section className='cultivos'>
        <div className='cultivos-contenido'>
          <div className='cultivo1'>
            <div className='cultivo-texto'>
              <h2>FINCA LA HUACA</h2>
              <p>En la finca “La Guaca”, ubicada en la vereda Soaga, municipio de Ubaté (Cundinamarca), se desarrolla un cultivo de arándanos compuesto por aproximadamente 50 arbustos. El sistema productivo implementa riego por goteo, lo que garantiza un suministro eficiente y controlado de agua. Además, el cultivo se encuentra protegido con un plástico de cobertura, medida destinada a mitigar los efectos de los cambios climáticos y preservar la calidad de la producción.</p>
              <div className='botones-cultivo'>
                <button className='boton4'>Acerca del cultivo</button>
              </div>
              
            </div>
            <div className='cultivo-imagen'>
            <img src="/Imagenes/arbustos.jpg"/>
            </div>
          </div>
        </div>

      </section>
    </main>
    <footer className='footer'>
      <p>© 2025 AgrIoT. Todos los derechos reservados.</p>
    </footer>
   
    </>
    

  );
}

