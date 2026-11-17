import { useState, useEffect } from "react";
import type { Medidor } from "../types/medidor";
import { medidorService } from "../services/medidorService";

export const useMedidores = () => {
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedidores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medidorService.getAll();
      setMedidores(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Error al cargar medidores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedidores();
  }, []);

  return { medidores, loading, error, refetch: fetchMedidores };
};