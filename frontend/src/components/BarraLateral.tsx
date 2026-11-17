import { Link, useLocation } from "react-router-dom";
import type { MenuItem } from "../ModernRouter";

interface Props {
  menuItems: MenuItem[];
}

const BarraLateral: React.FC<Props> = ({ menuItems }) => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-red-700 text-white hidden lg:flex flex-col justify-between">
      <div>
<div className="flex items-center justify-center h-16 bg-red-800 px-3 gap-2">
  <img
    src="/setar.png"
    alt="SETAR Yacuiba"
    className="h-10 object-contain"
  />
  <span className="text-white font-bold text-base">SETAR Yacuiba</span>
</div>
        <p className="text-center text-xs text-red-200 py-2 border-b border-red-600">
          Geolocalización de Medidores
        </p>
        <nav className="mt-4 px-2 space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={index}
                to={item.url}
                className={`flex items-center px-4 py-2.5 rounded-lg transition ${
                  isActive
                    ? "bg-white text-red-700 font-semibold shadow"
                    : "hover:bg-red-600 hover:text-white"
                }`}
              >
                <i className={`fa-solid fa-${item.icon} w-6`}></i>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 bg-red-800">
        <a
          href="#"
          className="flex items-center text-red-100 hover:text-white transition"
        >
          <i className="fa-solid fa-right-from-bracket w-6"></i> Cerrar Sesión
        </a>
      </div>
    </aside>
  );
};

export default BarraLateral;