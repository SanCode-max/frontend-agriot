import { useState } from "react";
import "../css componentes/Calculadora.css";

export default function Calculadora() {
  const [pantalla, setPantalla] = useState("");
  const [notas, setNotas] = useState("");
  const [historial, setHistorial] = useState([]);

  const agregar = (valor) => {
    setPantalla(pantalla + valor);
  };

  const limpiar = () => {
    setPantalla("");
  };

  const borrarUno = () => {
    setPantalla(pantalla.slice(0, -1));
  };

  const calcular = () => {
    try {
      // Evaluación acotada: solo números y operadores básicos (evita código arbitrario).
      if (!/^[\d+\-*/().\s]+$/.test(pantalla)) {
        setPantalla("Error");
        return;
      }
      // eslint-disable-next-line no-new-func -- expresión validada arriba; alternativa sería un parser completo
      const resultado = Function('"use strict";return (' + pantalla + ')')();
      setHistorial([...historial, `${pantalla} = ${resultado}`]);
      setPantalla(resultado.toString());
    } catch {
      setPantalla("Error");
    }
  };

  return (
    <div className="contenedor-calculadora">

      {/* PANEL IZQUIERDO */}
      <div className="calculadora">
        <h2>Calculadora de Cultivos</h2>

        <input
          type="text"
          value={pantalla}
          readOnly
          className="pantalla"
        />

        <div className="botones">
          <button onClick={() => agregar("7")}>7</button>
          <button onClick={() => agregar("8")}>8</button>
          <button onClick={() => agregar("9")}>9</button>
          <button onClick={() => agregar("/")}>÷</button>

          <button onClick={() => agregar("4")}>4</button>
          <button onClick={() => agregar("5")}>5</button>
          <button onClick={() => agregar("6")}>6</button>
          <button onClick={() => agregar("*")}>×</button>

          <button onClick={() => agregar("1")}>1</button>
          <button onClick={() => agregar("2")}>2</button>
          <button onClick={() => agregar("3")}>3</button>
          <button onClick={() => agregar("-")}>−</button>

          <button onClick={() => agregar("0")}>0</button>
          <button onClick={limpiar}>C</button>
          <button onClick={calcular}>=</button>
          <button onClick={() => agregar("+")}>+</button>

          <button className="borrar" onClick={borrarUno}>⌫</button>
        </div>

        {/* Historial */}
        <div className="historial">
          <h3>Historial</h3>
          {historial.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="notas-panel">
        <h2>Notas del Cliente</h2>
        <textarea
          placeholder="Escribe aquí observaciones, costos, fertilizantes, cantidades o cálculos importantes..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

    </div>
  );
}