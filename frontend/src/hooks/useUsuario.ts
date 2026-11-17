import { useState, useEffect } from "react";
import type { Usuario } from "../types/usuario";
import { usuarioService } from "../services/usuarioService";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return { usuarios, loading, error, refetch: fetchUsuarios };
};