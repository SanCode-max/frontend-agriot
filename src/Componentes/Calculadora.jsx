import { useState } from "react";
import "../css componentes/Calculadora.css";

export default function Calculadora() {

  const [pantalla, setPantalla] = useState("");

  const agregar = (valor) => {
    setPantalla(pantalla + valor);
  };

  const limpiar = () => {
    setPantalla("");
  };

  const calcular = () => {
    try {
      setPantalla(eval(pantalla).toString());
    } catch {
      setPantalla("Error");
    }
  };

  return (
    <div className="calculadora">

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

      </div>

    </div>
  );
}