import { Suspense, useEffect, useState } from "react";
import { ModernRouter, type MenuItem } from "./ModernRouter";
import { filtrarMenuPorRol } from "./config/permisos";

const todosLosMenus: MenuItem[] = [
  //  ADMINISTRADOR
  { name: "Inicio", icon: "house", url: "/", active: true, component: "Dashboard" },
  { name: "Mapa de Medidores", icon: "map-location-dot", url: "/mapa", active: false, component: "MapaMedidores" },
  { name: "Medidores", icon: "gauge-high", url: "/medidores", active: false, component: "Medidores" },
  { name: "Clientes", icon: "users", url: "/clientes", active: false, component: "Clientes" },
  { name: "Usuarios", icon: "user-gear", url: "/usuarios", active: false, component: "Usuarios" },
  { name: "Técnicos", icon: "screwdriver-wrench", url: "/tecnicos", active: false, component: "Tecnicos" },
  { name: "Reportes", icon: "chart-line", url: "/reportes", active: false, component: "Reportes" },
  { name: "Calendario", icon: "calendar-days", url: "/calendario", active: false, component: "Calendario" },

  //  TÉCNICO
  { name: "Mi Panel", icon: "house", url: "/mi-panel", active: false, component: "MiPanel" },
  { name: "Mi Mapa", icon: "map-location-dot", url: "/mi-mapa", active: false, component: "MiMapa" },
  { name: "Mis Medidores", icon: "gauge-high", url: "/mis-medidores", active: false, component: "MisMedidores" },
  { name: "Mi Calendario", icon: "calendar-days", url: "/mi-calendario", active: false, component: "MiCalendario" },

  //  USUARIO (Cliente)
  { name: "Mi Inicio", icon: "house", url: "/mi-inicio", active: false, component: "MiInicio" },
  { name: "Mi Consumo", icon: "chart-line", url: "/mi-consumo", active: false, component: "MiConsumo" },
  { name: "Mi Facturación", icon: "file-invoice-dollar", url: "/mi-facturacion", active: false, component: "MiFacturacion" },
  { name: "Pagar", icon: "qrcode", url: "/mi-pago", active: false, component: "MiPago" },
  { name: "Mi Perfil", icon: "user", url: "/mi-perfil", active: false, component: "MiPerfil" },
  { name: "Reclamos", icon: "comment-dots", url: "/reclamos", active: false, component: "Reclamos" },

  // TODOS
  { name: "Acerca de", icon: "info", url: "/about", active: false, component: "About" },
];

function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [usuario, setUsuario] = useState("");

  useEffect(() => {
    const sesionStr = localStorage.getItem("usuario");
    if (sesionStr) {
      try {
        const sesion = JSON.parse(sesionStr);
        setUsuario(sesion.nombre || sesion.usuario);
        const menuFiltrado = filtrarMenuPorRol(todosLosMenus, sesion.rol);
        setMenuItems(menuFiltrado);
      } catch (e) {
        console.error(e);
      }
    } else {
      setUsuario("Invitado");
      setMenuItems([]);
    }
  }, []);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-white text-red-600 font-bold text-lg">
          <i className="fa-solid fa-spinner fa-spin mr-3"></i>
          Cargando SETAR Yacuiba...
        </div>
      }
    >
      <ModernRouter usuario={usuario} menuItems={menuItems} />
    </Suspense>
  );
}

export default App;