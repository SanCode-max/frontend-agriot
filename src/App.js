import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ChatWidget from './Componentes/ChatWidget.jsx';
import Principal from './Componentes/Principal';
import PrincipioSesion from './Componentes/PrincipioSesion';
import Sesion from './Componentes/InicioSesion';
import Registro from './Componentes/Registro';
import  Restaurar from './Componentes/RestaurarContraseña';
import Inicio from './Componentes/Inicio';
import Campos from './Componentes/Campos_reestablecimiento';
import UsuarioDashboard from './Componentes/UsuarioDashboard';
import CrearUsuario from './Componentes/CrearUsuario';
import CambiarPasswordInicial from './Componentes/CambiarPasswordInicial';
import CultivoMonitoreo from './Componentes/CultivoMonitoreo';
import MapaCultivos from './Componentes/MapaCultivos';
import CalculadoraNutricional from './Componentes/CalculadoraNutricional';
import AgendaNotas from './Componentes/AgendaNotas';
import CentroAlertas from './Componentes/CentroAlertas';
import { apiFetch } from './services/apiClient';

const SESSION_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

function SessionInactivityGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!localStorage.getItem('token')) return undefined;

    let timeoutId;
    let expired = false;
    const expireSession = () => {
      if (expired) return;
      expired = true;
      const logoutRequest = apiFetch('/logout', { method: 'POST' }).catch(() => {});
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/login', { replace: true, state: { sessionExpired: true } });
      return logoutRequest;
    };
    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(expireSession, SESSION_IDLE_TIMEOUT_MS);
    };
    const onStorage = event => {
      if (event.key === 'token' && !event.newValue) {
        localStorage.removeItem('usuario');
        navigate('/login', { replace: true });
      }
    };
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'click', 'scroll', 'touchstart', 'pointerdown'];
    activityEvents.forEach(name => window.addEventListener(name, resetTimer, { passive: true }));
    window.addEventListener('storage', onStorage);
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach(name => window.removeEventListener(name, resetTimer));
      window.removeEventListener('storage', onStorage);
    };
  }, [location.pathname, navigate]);

  return null;
}

function RutaProtegida({ children }) {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (usuario.must_change_password) return <Navigate to="/cambiar-password" replace />;
  return children;
}

function MyApp() {
  return (
    <Router>
      <SessionInactivityGuard />
      <ChatWidget />
      <Routes>
        <Route path='/' element={<Principal/>}/>
        <Route path='/Bienvenida' element={<PrincipioSesion/>}/>
        <Route path='/login' element={<Sesion/>}/>
        <Route path='/registro' element={<Registro/>}/>
        <Route path='/Restauracion' element= {<Restaurar/>}/>
        <Route path='/Inicio' element={<Inicio/>}/>
        <Route path='/restablecer-password' element={<Campos/>}/>
        <Route path='/cambiar-password' element={localStorage.getItem('token') ? <CambiarPasswordInicial/> : <Navigate to='/login' replace/>}/>
        <Route path='/dashboard/usuario' element={<RutaProtegida><UsuarioDashboard/></RutaProtegida>}/>
        <Route path='/calculadora-nutricional' element={<RutaProtegida><CalculadoraNutricional/></RutaProtegida>}/>
        <Route path='/agenda' element={<RutaProtegida><AgendaNotas/></RutaProtegida>}/>
        <Route path='/alertas' element={<RutaProtegida><CentroAlertas/></RutaProtegida>}/>
        <Route path='/cultivos/:id' element={<RutaProtegida><CultivoMonitoreo/></RutaProtegida>}/>
        <Route path='/mapa' element={<RutaProtegida><MapaCultivos/></RutaProtegida>}/>
        <Route path='/admin/usuarios' element={<RutaProtegida><CrearUsuario/></RutaProtegida>}/>
      </Routes>
    </Router>
    
  );
}

export default MyApp;
