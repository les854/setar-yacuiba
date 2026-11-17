import type { ComponentType } from "react";
import Dashboard from "./pages/Dashboard";
import MapaMedidores from "./pages/MapaMedidores";
import Medidores from "./pages/Medidores";
import Clientes from "./pages/Clientes";
import Usuarios from "./pages/Usuarios";
import Tecnicos from "./pages/Tecnicos";
import Reportes from "./pages/Reportes";
import About from "./pages/About";
import Consultas from "./pages/Consultas";
import Calendario from "./pages/Calendario";
import MiPanel from "./pages/MiPanel";
import MisMedidores from "./pages/MisMedidores";
import MiCalendario from "./pages/MiCalendario";
import MiInicio from "./pages/MiInicio";
import MiConsumo from "./pages/MiConsumo";
import MiFacturacion from "./pages/MiFacturacion";
import MiPago from "./pages/MiPago";
import MiPerfil from "./pages/MiPerfil";
import Reclamos from "./pages/Reclamos";
import MiMapa from "./pages/MiMapa";

export const componentRegistry: Record<string, ComponentType<any>> = {
  Dashboard,
  MapaMedidores,
  Medidores,
  Clientes,
  Usuarios,
  Tecnicos,
  Reportes,
  About,
  Calendario,
  MiPanel,
  MisMedidores,
  MiCalendario,
  MiInicio,
  MiConsumo,
  MiFacturacion,
  MiPago,
  MiPerfil,
  Reclamos,
  MiMapa,
};