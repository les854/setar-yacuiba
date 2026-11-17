import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { MenuItem } from "../ModernRouter";

interface Props {
  usuario: string;
  onLogout: () => void;
  menuItems: MenuItem[];
}

const BarraSuperior: React.FC<Props> = ({ usuario, onLogout, menuItems }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropdownUsuario, setDropdownUsuario] = useState(false);
  const [rol, setRol] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  //  Leer el rol del localStorage
  useEffect(() => {
    const sesionStr = localStorage.getItem("usuario");
    if (sesionStr) {
      try {
        const sesion = JSON.parse(sesionStr);
        setRol(sesion.rol || "");
      } catch (e) {
        console.error("Error al leer la sesión:", e);
      }
    }
  }, []);

  const irA = (url: string) => {
    navigate(url);
    setMenuAbierto(false);
  };

  return (
    <>
      <header className="h-16 bg-white shadow flex items-center justify-between px-4 md:px-6 z-30 border-b-2 border-red-600 sticky top-0">
        <div className="flex items-center">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="text-red-600 hover:text-red-800 focus:outline-none mr-3 p-2 rounded-lg hover:bg-red-50 transition"
            title="Abrir menú"
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </button>

          <span className="font-semibold text-gray-800 text-base md:text-lg truncate flex items-center gap-2">
            <img
              src="/logo-setar.png"
              alt="SETAR"
              className="h-8 w-8 object-contain"
            />
            Panel de Control
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-gray-600 text-sm hidden sm:inline">
            Hola, <strong className="text-red-700">{usuario}</strong>
          </span>

          <div className="relative">
            <button
              onClick={() => setDropdownUsuario(!dropdownUsuario)}
              className="h-9 w-9 bg-red-600 text-white rounded-full flex items-center justify-center font-bold hover:bg-red-700 transition"
            >
              {usuario.charAt(0).toUpperCase()}
            </button>

            {dropdownUsuario && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{usuario}</p>
                  <p className="text-xs text-red-600 font-medium">{rol || "Usuario"}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center"
                >
                  <i className="fa-solid fa-right-from-bracket mr-2"></i>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/*  Menú lateral con z-index alto */}
      {menuAbierto && (
        <>
          <div
            className="fixed inset-0 bg-black/80"
            style={{ zIndex: 9998 }}
            onClick={() => setMenuAbierto(false)}
          ></div>

          <aside
            className="fixed top-0 left-0 h-screen w-72 bg-red-700 text-white shadow-2xl flex flex-col justify-between"
            style={{ zIndex: 9999 }}
          >
            <div>
              <div className="flex items-center justify-between h-16 px-4 bg-red-800">
                <div className="flex items-center gap-2">
                  <img
                    src="/setar.png"
                    alt="SETAR Yacuiba"
                    className="h-9 w-9 object-contain bg-white rounded-full p-1"
                  />
                  <span className="font-bold text-white">SETAR Yacuiba</span>
                </div>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="text-white"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <p className="text-center text-xs text-red-200 py-2 border-b border-red-600">
                Geolocalización de Medidores
              </p>

              <nav className="mt-4 px-2 space-y-1 overflow-y-auto">
                {menuItems.map((item, i) => {
                  const activo = location.pathname === item.url;
                  return (
                    <button
                      key={i}
                      onClick={() => irA(item.url)}
                      className={`w-full flex items-center px-4 py-2.5 rounded-lg transition text-left ${
                        activo
                          ? "bg-white text-red-700 font-semibold shadow"
                          : "hover:bg-red-600 hover:text-white"
                      }`}
                    >
                      <i className={`fa-solid fa-${item.icon} w-6`}></i>
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 bg-red-800">
              <button
                onClick={onLogout}
                className="flex items-center text-red-100 hover:text-white transition w-full"
              >
                <i className="fa-solid fa-right-from-bracket w-6"></i>
                Cerrar Sesión
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default BarraSuperior;