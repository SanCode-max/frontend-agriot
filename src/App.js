import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path='/admin/usuarios' element={<RutaProtegida><CrearUsuario/></RutaProtegida>}/>
      </Routes>
    </Router>
    
  );
}

export default MyApp;
