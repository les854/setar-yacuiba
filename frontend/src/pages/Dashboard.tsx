import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clienteService } from "../services/clienteService";
import { medidorService } from "../services/medidorService";
import { tecnicoService } from "../services/tecnicoService";

// ============================================
// TIPOS
// ============================================
interface Stats {
  clientes: number;
  medidores: number;
  tecnicos: number;
  operativos: number;
  mantenimiento: number;
  dañados: number;
  inactivos: number;
}

interface SesionGuardada {
  nombre: string;
  rol: string;
}

// ============================================
// COMPONENTE: Tarjeta KPI
// ============================================
const TarjetaKPI: React.FC<{
  label: string;
  valor: number | string;
  icono: string;
  detalle: string;
  cargando?: boolean;
  colorIcono?: string;
}> = ({ label, valor, icono, detalle, cargando, colorIcono = "bg-red-50 text-red-600" }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600 flex items-center justify-between hover:shadow-md transition">
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      {cargando ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
      ) : (
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{valor}</h3>
      )}
      <p className="text-xs text-gray-500 mt-1">{detalle}</p>
    </div>
    <div className={`p-3 ${colorIcono} rounded-lg`}>
      <i className={`fa-solid ${icono} text-xl`}></i>
    </div>
  </div>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sesion, setSesion] = useState<SesionGuardada | null>(null);
  const [stats, setStats] = useState<Stats>({
    clientes: 0,
    medidores: 0,
    tecnicos: 0,
    operativos: 0,
    mantenimiento: 0,
    dañados: 0,
    inactivos: 0,
  });
  const [cargando, setCargando] = useState(true);

  // Cargar sesión guardada
  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setSesion({ nombre: parsed.nombre, rol: parsed.rol });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Cargar estadísticas desde el backend
  useEffect(() => {
    const cargarStats = async () => {
      try {
        const [clientes, medidores, tecnicos] = await Promise.all([
          clienteService.getAll().catch(() => []),
          medidorService.getAll().catch(() => []),
          tecnicoService.getAll().catch(() => []),
        ]);

        setStats({
          clientes: clientes.length,
          medidores: medidores.length,
          tecnicos: tecnicos.length,
          operativos: medidores.filter((m) => m.estado === "Instalado").length,
          mantenimiento: medidores.filter((m) => m.estado === "Mantenimiento").length,
          dañados: medidores.filter((m) => m.estado === "Dañado").length,
          inactivos: medidores.filter((m) => m.estado === "Inactivo").length,
        });
      } catch (err) {
        console.error("Error cargando stats:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarStats();
  }, []);

  // ============================================
  // CÁLCULOS
  // ============================================
  const porcentajeOperativos = stats.medidores
    ? Math.round((stats.operativos / stats.medidores) * 100)
    : 0;

  const fecha = new Date().toLocaleDateString("es-BO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  // ============================================
  // ACCESOS RÁPIDOS
  // ============================================
  const accesos = [
    {
      titulo: "Mapa de Medidores",
      descripcion: "Ver ubicación geográfica de todos los medidores",
      icono: "fa-map-location-dot",
      ruta: "/mapa",
      color: "bg-red-100 text-red-600",
    },
    {
      titulo: "Gestionar Medidores",
      descripcion: "Registrar, editar y eliminar medidores",
      icono: "fa-gauge-high",
      ruta: "/medidores",
      color: "bg-red-100 text-red-600",
    },
    {
      titulo: "Gestionar Clientes",
      descripcion: "Administrar clientes del sistema",
      icono: "fa-users",
      ruta: "/clientes",
      color: "bg-red-100 text-red-600",
    },
    {
      titulo: "Gestionar Técnicos",
      descripcion: "Administrar técnicos de campo",
      icono: "fa-screwdriver-wrench",
      ruta: "/tecnicos",
      color: "bg-red-100 text-red-600",
    },
  ];

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-6 space-y-6">
      {/* ============================================
          BIENVENIDA
      ============================================ */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 rounded-2xl p-8 text-white shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-red-100 text-sm mb-1">{fecha}</p>
            <h1 className="text-3xl font-bold mb-2">
              {saludo}, {sesion?.nombre || "Administrador"} 
            </h1>
            <p className="text-red-100 text-sm">
              Panel de administración - Sistema de Geolocalización de Medidores
            </p>
          </div>
    <div className="bg-white rounded-xl p-3 shadow-lg min-w-[220px] flex items-center justify-center">
  <img
    src="/setar.png"
    alt="SETAR Yacuiba"
    className="h-20 w-full object-contain"
  />
</div>
        </div>
      </div>

      {/* ============================================
          KPIs PRINCIPALES
      ============================================ */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
          <i className="fa-solid fa-chart-line text-red-600 mr-2"></i>
          Resumen General
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <TarjetaKPI
            label="Total Medidores"
            valor={stats.medidores}
            icono="fa-gauge-high"
            detalle="Registrados en Yacuiba"
            cargando={cargando}
          />
          <TarjetaKPI
            label="Clientes"
            valor={stats.clientes}
            icono="fa-users"
            detalle="Con servicio eléctrico"
            cargando={cargando}
          />
          <TarjetaKPI
            label="Técnicos"
            valor={stats.tecnicos}
            icono="fa-screwdriver-wrench"
            detalle="Personal activo"
            cargando={cargando}
          />
          <TarjetaKPI
            label="Medidores OK"
            valor={`${porcentajeOperativos}%`}
            icono="fa-circle-check"
            detalle={`${stats.operativos} de ${stats.medidores}`}
            cargando={cargando}
            colorIcono="bg-green-50 text-green-600"
          />
        </div>
      </div>

      {/* ============================================
          ESTADO DE MEDIDORES + ACCESOS
      ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución de medidores */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i className="fa-solid fa-chart-pie text-red-600 mr-2"></i>
            Estado de Medidores
          </h3>

          <div className="space-y-4">
            {/* Operativos */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center text-gray-700">
                  <i className="fa-solid fa-circle text-green-500 text-xs mr-2"></i>
                  Instalados
                </span>
                <span className="font-semibold text-gray-800">
                  {stats.operativos}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.medidores
                        ? (stats.operativos / stats.medidores) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Mantenimiento */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center text-gray-700">
                  <i className="fa-solid fa-circle text-yellow-500 text-xs mr-2"></i>
                  Mantenimiento
                </span>
                <span className="font-semibold text-gray-800">
                  {stats.mantenimiento}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.medidores
                        ? (stats.mantenimiento / stats.medidores) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Dañados */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center text-gray-700">
                  <i className="fa-solid fa-circle text-red-500 text-xs mr-2"></i>
                  Dañados
                </span>
                <span className="font-semibold text-gray-800">
                  {stats.dañados}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.medidores
                        ? (stats.dañados / stats.medidores) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Inactivos */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center text-gray-700">
                  <i className="fa-solid fa-circle text-gray-400 text-xs mr-2"></i>
                  Inactivos
                </span>
                <span className="font-semibold text-gray-800">
                  {stats.inactivos}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.medidores
                        ? (stats.inactivos / stats.medidores) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
            <i className="fa-solid fa-bolt text-red-600 mr-2"></i>
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accesos.map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(a.ruta)}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-red-300 hover:shadow-md transition text-left group"
              >
                <div
                  className={`h-12 w-12 ${a.color} rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition`}
                >
                  <i className={`fa-solid ${a.icono} text-xl`}></i>
                </div>
                <h4 className="font-bold text-gray-800 mb-1">{a.titulo}</h4>
                <p className="text-xs text-gray-500 mb-2">{a.descripcion}</p>
                <div className="text-red-600 text-xs font-semibold flex items-center">
                  Ir ahora
                  <i className="fa-solid fa-arrow-right ml-1 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          ESTADO DEL SISTEMA + INFO
      ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado del sistema */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i className="fa-solid fa-server text-red-600 mr-2"></i>
            Estado del Sistema
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm text-gray-700 font-medium">
                  Servidor Backend
                </span>
              </div>
              <span className="text-xs text-green-700 font-semibold">
                ● En línea
              </span>
            </li>
            <li className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm text-gray-700 font-medium">
                  Base de Datos PostgreSQL
                </span>
              </div>
              <span className="text-xs text-green-700 font-semibold">
                ● Conectada
              </span>
            </li>
            <li className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm text-gray-700 font-medium">
                  API REST
                </span>
              </div>
              <span className="text-xs text-green-700 font-semibold">
                ● Activa
              </span>
            </li>
            <li className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm text-gray-700 font-medium">
                  Geolocalización
                </span>
              </div>
              <span className="text-xs text-green-700 font-semibold">
                ● Funcionando
              </span>
            </li>
          </ul>
        </div>

        {/* Info del sistema */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i className="fa-solid fa-circle-info text-red-600 mr-2"></i>
            Información del Sistema
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Sistema</span>
              <span className="font-medium text-gray-800 text-right">
                Geolocalización de Medidores
              </span>
            </li>
            <li className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Empresa</span>
              <span className="font-medium text-gray-800">SETAR Yacuiba</span>
            </li>
            <li className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Usuario</span>
              <span className="font-medium text-gray-800">
                {sesion?.nombre || "-"}
              </span>
            </li>
            <li className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Rol</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                {sesion?.rol || "-"}
              </span>
            </li>
            <li className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Versión</span>
              <span className="font-medium text-gray-800">1.0.0</span>
            </li>
            <li className="flex justify-between py-2">
              <span className="text-gray-500">Ubicación</span>
              <span className="font-medium text-gray-800">
                Yacuiba, Tarija
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;