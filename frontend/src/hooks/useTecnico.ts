import { useState, useEffect } from "react";
import type { Tecnico } from "../types/tecnico";
import { tecnicoService } from "../services/tecnicoService";

export const useTecnicos = () => {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTecnicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tecnicoService.getAll();
      setTecnicos(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Error al cargar técnicos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTecnicos();
  }, []);

  return { tecnicos, loading, error, refetch: fetchTecnicos };
};