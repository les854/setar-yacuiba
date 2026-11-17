import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginResponse, Sesion } from "../types/usuario";

const API_URL = "http://localhost:4000/api";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      // DEBUG: Mostrar la respuesta del backend en consola
      console.log("Respuesta del backend:", data);

      if (!response.ok) {
        setError(data.message || data.error || "Credenciales incorrectas");
        return;
      }

      // ✅ CORREGIDO: Usar data.usuario en lugar de data.user
      const usuarioBackend = data.usuario;

      if (!usuarioBackend) {
        setError("Respuesta del servidor inválida");
        console.error("No se encontró usuario en la respuesta:", data);
        return;
      }

      const sesion: Sesion = {
        id_usuario: usuarioBackend.id_usuario,
        nombre: usuarioBackend.nombre,
        usuario: usuarioBackend.usuario,
        rol: usuarioBackend.rol,
        token: data.token,
      };

      console.log("Sesión guardada:", sesion);

      // Guardar en localStorage
      localStorage.setItem("usuario", JSON.stringify(sesion));

      // Redirigir según rol
      if (sesion.rol === "Administrador") {
        window.location.href = "/";
      } else if (sesion.rol === "Tecnico") {
        window.location.href = "/mi-panel";
      } else if (sesion.rol === "Cliente") {
        window.location.href = "/mi-inicio";
      } else {
        window.location.href = "/mi-inicio";
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-700 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-red-600 p-2">
            <img
              src="/logo-setar.png"
              alt="SETAR Yacuiba"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">SETAR Yacuiba</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Sistema de Geolocalización de Medidores
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ej: juan.perez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ingrese su contraseña"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-2.5 flex items-center">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Iniciando sesión...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket mr-2"></i>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;