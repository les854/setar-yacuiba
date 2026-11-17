import { Outlet, useNavigate } from "react-router-dom";
import BarraLateral from "../components/BarraLateral";
import BarraSuperior from "../components/BarraSuperior";
import type { MenuItem } from "../ModernRouter";

interface Props {
  usuario: string;
  menuItems: MenuItem[];
}

const Layout: React.FC<Props> = ({ usuario, menuItems }) => {
  const navigate = useNavigate();

  //  FUNCIÓN DE LOGOUT CORREGIDA
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/login";  // ← Recarga completa para actualizar el menú
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <BarraLateral menuItems={menuItems} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <BarraSuperior
          usuario={usuario}
          onLogout={handleLogout}
          menuItems={menuItems}
        />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="bg-white border-t border-red-100 py-4 text-center text-xs text-gray-500">
          &copy; 2026 <strong className="text-red-700">SETAR Yacuiba</strong> -
          Sistema de Geolocalización de Medidores
        </footer>
      </div>
    </div>
  );
};

export default Layout;