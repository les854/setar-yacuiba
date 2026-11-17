import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import Layout from "./pages/Layout";
import Default from "./pages/Defaul";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import { componentRegistry } from "./routesConfig";
import { puedeVerRuta } from "./config/permisos";

export interface MenuItem {
  name: string;
  icon: string;
  active?: boolean;
  url: string;
  component?: string;
}

interface DynamicRoute {
  menuItems: MenuItem[];
  usuario: string;
}

function RutaProtegida({ ruta, children }: { ruta: string; children: React.ReactNode }) {
  const sesionStr = localStorage.getItem("usuario");

  if (!sesionStr) {
    return <Navigate to="/login" replace />;
  }

  let rol = "";
  try {
    const sesion = JSON.parse(sesionStr);
    rol = sesion.rol;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  if (!puedeVerRuta(rol, ruta)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-8 text-center">
          <i className="fa-solid fa-lock text-5xl mb-4"></i>
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-sm">
            Tu rol <strong>{rol}</strong> no tiene permiso para acceder a esta página.
          </p>
          <a
            href="/"
            className="inline-block mt-4 bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function ModernRouter({ menuItems, usuario }: DynamicRoute) {
  const [router, setRouter] = useState<any>(null);

  useEffect(() => {
    async function initRoutes() {
      const dynamicRoutes: RouteObject[] = Array.isArray(menuItems)
        ? menuItems.map((item) => {
            const Component = item.component
              ? componentRegistry[item.component] ?? Default
              : Default;

            return {
              path: item.url,
              element: (
                <RutaProtegida ruta={item.url}>
                  <Component />
                </RutaProtegida>
              ),
            };
          })
        : [];

      const routerInstance = createBrowserRouter([
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/",
          element: <Layout usuario={usuario} menuItems={menuItems} />,
          children: [
            {
              index: true,
              element: (
                <RutaProtegida ruta="/">
                  <Dashboard />
                </RutaProtegida>
              ),
            },
            ...dynamicRoutes,
            {
              path: "*",
              element: <Default />,
            },
          ],
        },
      ]);

      setRouter(routerInstance);
    }

    initRoutes();
  }, [menuItems, usuario]);

  if (!router)
    return (
      <div className="flex items-center justify-center h-screen bg-white text-red-600 font-bold text-lg">
        <i className="fa-solid fa-spinner fa-spin mr-3"></i>
        Iniciando aplicación...
      </div>
    );

  return <RouterProvider router={router} />;
}