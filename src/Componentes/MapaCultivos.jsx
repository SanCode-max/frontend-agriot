import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiFetch } from "../services/apiClient";

// Crear iconos por color
const crearIcono = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

// Estado → color
const obtenerIconoPorEstado = (estado) => {
  const estadoNormalizado = (estado || "").toLowerCase();

  if (estadoNormalizado.includes("crecimiento")) return crearIcono("green");
  if (
    estadoNormalizado.includes("producción") ||
    estadoNormalizado.includes("produccion") ||
    estadoNormalizado.includes("cosecha") ||
    estadoNormalizado.includes("cosechado")
  )
    return crearIcono("yellow");
  if (
    estadoNormalizado.includes("problema") ||
    estadoNormalizado.includes("secado")
  )
    return crearIcono("red");

  return crearIcono("blue");
};

// Ajustar mapa automáticamente
function AjustarMapa({ cultivos }) {
  const map = useMap();

  useEffect(() => {
    const posicionesValidas = cultivos
      .filter((c) => c.latitud && c.longitud)
      .map((c) => [parseFloat(c.latitud), parseFloat(c.longitud)]);

    if (posicionesValidas.length === 0) return;

    // Si solo hay un cultivo
    if (posicionesValidas.length === 1) {
      map.setView(posicionesValidas[0], 14);
      return;
    }

    // Si hay varios cultivos
    const bounds = L.latLngBounds(posicionesValidas);
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [cultivos, map]);

  return null;
}

export default function MapaCultivos() {
  const [cultivos, setCultivos] = useState([]);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (usuario?.correo) {
      apiFetch(`/cultivos/${usuario.correo}`)
        .then((response) => response.json())
        .then((data) => {
          setCultivos(data.cultivos || []);
        })
        .catch((error) => {
          console.error("Error cargando cultivos:", error);
        });
    }
  }, []);

  return (
    <div className="mapa-cultivos-root">
      <MapContainer
        center={[4.5709, -74.2973]} // Colombia inicial
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AjustarMapa cultivos={cultivos} />

        {cultivos.map((cultivo) => {
          if (!cultivo.latitud || !cultivo.longitud) return null;

          return (
            <Marker
              key={cultivo.id}
              position={[
                parseFloat(cultivo.latitud),
                parseFloat(cultivo.longitud),
              ]}
              icon={obtenerIconoPorEstado(cultivo.estado)}
            >
              <Popup>
                <div>
                  <h3>{cultivo.nombre}</h3>
                  <p><strong>Estado:</strong> {cultivo.estado}</p>
                  <p><strong>Ubicación:</strong> {cultivo.ubicacion}</p>
                  <p><strong>Siembra:</strong> {cultivo.fechaSiembra}</p>
                  {cultivo.fechaCosecha && (
                    <p><strong>Cosecha:</strong> {cultivo.fechaCosecha}</p>
                  )}
                  <p><strong>Observaciones:</strong> {cultivo.observaciones}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}