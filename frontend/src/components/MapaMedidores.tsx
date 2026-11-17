import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Medidor } from "../types/medidor";

interface Props {
  medidores?: Medidor[];
  altura?: string;
}

const colores: Record<string, string> = {
  Instalado: "#22c55e",
  Mantenimiento: "#eab308",
  Inactivo: "#6b7280",
  Dañado: "#ef4444",
  "En revisión": "#3b82f6",
};

const MapaMedidores: React.FC<Props> = ({
  medidores = [],
  altura = "500px",
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  //  Inicializar mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([-22.0167, -63.6833], 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  //  Actualizar marcadores
  useEffect(() => {
    if (!markersRef.current) return;
    if (!Array.isArray(medidores)) return;

    markersRef.current.clearLayers();

    const crearIcono = (color: string) =>
      L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

    const puntos: [number, number][] = [];

    medidores.forEach((m) => {
      //  Usar las propiedades REALES del tipo Medidor
      const lat = Number(m.latitud);
      const lng = Number(m.longitud);
      if (isNaN(lat) || isNaN(lng)) return;

      const color = colores[m.estado] || "#3b82f6";
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      L.marker([lat, lng], { icon: crearIcono(color) })
        .addTo(markersRef.current!)
        .bindPopup(
          `<div style="font-family:sans-serif;font-size:12px;min-width:180px;">
            <strong style="color:#dc2626;">${m.codigo_medidor}</strong><br/>
            <span style="color:#374151;"> ${m.cliente_nombre || "-"}</span><br/>
            <span style="color:#6b7280;"> ${m.direccion}</span><br/>
            <span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:4px;background:${color}22;color:${color};font-size:10px;font-weight:bold;">${m.estado}</span><br/>
            <a href="${googleMapsUrl}" target="_blank" style="display:inline-block;margin-top:8px;background:#22c55e;color:white;padding:6px 12px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:11px;"> Abrir en Google Maps</a>
          </div>`
        );

      puntos.push([lat, lng]);
    });

    // Ajustar vista si hay medidores
    if (puntos.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(puntos);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [medidores]);

  return (
    <div
      ref={containerRef}
      style={{
        height: altura,
        width: "100%",
        borderRadius: "0.75rem",
        zIndex: 1,
      }}
    ></div>
  );
};

export default MapaMedidores;