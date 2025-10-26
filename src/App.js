
import './App.css';
import react from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Principal from './Componentes/Principal';
import PrincipioSesion from './Componentes/PrincipioSesion';
import Sesion from './Componentes/InicioSesion';
import Registro from './Componentes/Registro';
import  Restaurar from './Componentes/RestaurarContraseña';
import Inicio from './Componentes/Inicio';

function MyApp() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Principal/>}/>
        <Route path='/Bienvenida' element={<PrincipioSesion/>}/>
        <Route path='/login' element={<Sesion/>}/>
        <Route path='/registro' element={<Registro/>}/>
        <Route path='/Restauracion' element= {<Restaurar/>}/>
        <Route path='/Inicio' element={<Inicio/>}/>
      </Routes>
    </Router>
    
  );
}

export default MyApp;
