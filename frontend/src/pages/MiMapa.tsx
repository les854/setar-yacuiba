import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import html2canvas from "html2canvas";
import { medidorService } from "../services/medidorService";
import type { Medidor } from "../types/medidor";

const colores: Record<string, string> = {
  Instalado: "#22c55e",
  Mantenimiento: "#eab308",
  Inactivo: "#6b7280",
  Dañado: "#ef4444",
  "En revisión": "#3b82f6",
};

const MiMapa: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("Todos");
  const [mapaListo, setMapaListo] = useState(false);
  const [capturando, setCapturando] = useState(false);

  //  Cargar medidores del técnico
  useEffect(() => {
    medidorService
      .getMisMedidores()
      .then((data) => {
        console.log(" Medidores cargados:", data);
        setMedidores(data);
      })
      .catch((err) => {
        console.error(" Error:", err);
        setError(err.response?.data?.error || "Error al cargar tus medidores");
      })
      .finally(() => setLoading(false));
  }, []);

  //  Inicializar mapa
  useEffect(() => {
    if (loading) return;
    if (!containerRef.current || mapRef.current) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [-22.0167, -63.6833],
        zoom: 14,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);

      setMapaListo(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
      }
    };
  }, [loading]);

  //  Agregar marcadores
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;
    if (!mapaListo) return;

    markersRef.current.clearLayers();

    const filtrados =
      filtro === "Todos"
        ? medidores
        : medidores.filter((m) => m.estado === filtro);

    const crearIcono = (color: string) =>
      L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color:${color};width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.5);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

    const puntos: [number, number][] = [];

    filtrados.forEach((m) => {
      const lat = Number(m.latitud);
      const lng = Number(m.longitud);
      if (isNaN(lat) || isNaN(lng)) return;

      const color = colores[m.estado] || "#3b82f6";

      //  Solo URL de Google Maps
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      const popupContent = `
        <div style="font-family:system-ui,sans-serif;font-size:13px;min-width:240px;">
          <div style="border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:8px;">
            <strong style="color:#dc2626;font-size:14px;">${m.codigo_medidor}</strong>
            <span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:4px;background:${color}22;color:${color};font-size:10px;font-weight:bold;">${m.estado}</span>
          </div>
          <div style="margin-bottom:6px;">
            <span style="color:#6b7280;font-size:11px;">CLIENTE</span><br/>
            <strong style="color:#374151;"> ${m.cliente_nombre || "-"}</strong>
          </div>
          <div style="margin-bottom:6px;">
            <span style="color:#6b7280;font-size:11px;">DIRECCIÓN</span><br/>
            <strong style="color:#374151;"> ${m.direccion}</strong>
          </div>
          <div style="margin-bottom:10px;">
            <span style="color:#6b7280;font-size:11px;">COORDENADAS</span><br/>
            <span style="font-family:monospace;font-size:10px;color:#6b7280;">${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer"
               style="display:flex;align-items:center;justify-content:center;gap:6px;background:#22c55e;color:white;padding:10px 12px;border-radius:6px;text-decoration:none;font-weight:600;font-size:12px;">
               Abrir en Google Maps
            </a>
          </div>
        </div>
      `;

      L.marker([lat, lng], { icon: crearIcono(color) })
        .addTo(markersRef.current!)
        .bindPopup(popupContent, { maxWidth: 300 });

      puntos.push([lat, lng]);
    });

    if (puntos.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(puntos);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 100);
    }
  }, [medidores, filtro, mapaListo]);

  //  Descargar mapa como imagen PNG
  const descargarMapa = async () => {
    if (!containerRef.current) return;

    setCapturando(true);
    try {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }

      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        ignoreElements: (el) => {
          return el.classList.contains("leaflet-control-attribution");
        },
      });

      const link = document.createElement("a");
      const fecha = new Date().toISOString().split("T")[0];
      const hora = new Date().toTimeString().slice(0, 5).replace(":", "-");
      link.download = `mapa-medidores-${fecha}_${hora}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();

      console.log(" Imagen descargada correctamente");
    } catch (err) {
      console.error(" Error al capturar:", err);
      alert("No se pudo capturar el mapa. Intenta de nuevo.");
    } finally {
      setCapturando(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
        Cargando tu mapa...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl p-4 flex items-center">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>
          {error}
        </div>
      </div>
    );
  }

  const estados = ["Todos", "Instalado", "Mantenimiento", "Dañado", "Inactivo"];

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center">
              <i className="fa-solid fa-map-location-dot text-red-600 mr-2"></i>
              Mi Mapa de Medidores Asignados
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {medidores.length} medidor{medidores.length !== 1 ? "es" : ""} asignado
              {medidores.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {estados.map((e) => (
              <button
                key={e}
                onClick={() => setFiltro(e)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filtro === e
                    ? "bg-red-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                {e}
              </button>
            ))}

            {/* Botón de captura */}
            <button
              onClick={descargarMapa}
              disabled={capturando}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
              title="Descargar captura del mapa"
            >
              {capturando ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Capturando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-camera"></i>
                  Descargar mapa
                </>
              )}
            </button>
          </div>
        </div>

        {medidores.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <i className="fa-solid fa-map text-5xl mb-3 text-gray-300"></i>
            <p className="font-semibold">No tienes medidores asignados</p>
            <p className="text-xs mt-1">
              Contacta al administrador para que te asigne medidores
            </p>
          </div>
        ) : (
          <div className="p-4">
            <div
              ref={containerRef}
              style={{
                height: "600px",
                width: "100%",
                minHeight: "600px",
                borderRadius: "0.75rem",
                border: "1px solid #e5e7eb",
              }}
            ></div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-red-600"></i>
              Haz clic en cualquier marcador para abrir la ubicación en Google Maps
            </p>
          </div>
        )}

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <span className="font-semibold text-gray-700">Leyenda:</span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            Instalado
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
            Mantenimiento
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            Dañado
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-1"></span>
            Inactivo
          </span>
        </div>
      </div>

      {/* Tabla de medidores */}
      {medidores.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center">
              <i className="fa-solid fa-list text-red-600 mr-2"></i>
              Mis Medidores
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 text-xs uppercase">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Dirección</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                {medidores.map((m) => {
                  const lat = Number(m.latitud);
                  const lng = Number(m.longitud);
                  //  URL de Google Maps
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

                  return (
                    <tr key={m.id_medidor} className="hover:bg-red-50/40">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-red-700">
                        {m.codigo_medidor}
                      </td>
                      <td className="py-3 px-4">{m.cliente_nombre || "-"}</td>
                      <td className="py-3 px-4 text-gray-500">{m.direccion}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            m.estado === "Instalado"
                              ? "bg-green-100 text-green-700"
                              : m.estado === "Mantenimiento"
                              ? "bg-yellow-100 text-yellow-700"
                              : m.estado === "Dañado"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {m.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {/*  Botón "Ver calle" que abre Google Maps */}
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 font-semibold text-xs inline-flex items-center gap-1"
                          title="Abrir ubicación en Google Maps"
                        >
                          <i className="fa-solid fa-map-location-dot"></i>
                          Ver calle
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiMapa;