import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000/api';

export default function Consultas() {
  const [medidores, setMedidores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('setar_token');
        const res = await fetch(`${API_URL}/medidores`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setMedidores(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = medidores.filter(m =>
    (m.codigo_medidor || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.cliente_nombre || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Consultas de Medidores</h1>

      <input
        type="text"
        placeholder="Buscar por código o cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">Código</th>
              <th className="p-3 text-left text-sm font-semibold">Cliente</th>
              <th className="p-3 text-left text-sm font-semibold">Marca</th>
              <th className="p-3 text-left text-sm font-semibold">Estado</th>
              <th className="p-3 text-left text-sm font-semibold">Dirección</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(m => (
              <tr key={m.id_medidor} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-blue-600">{m.codigo_medidor}</td>
                <td className="p-3">{m.cliente_nombre || '-'}</td>
                <td className="p-3">{m.marca || '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    m.estado === 'Instalado' ? 'bg-green-100 text-green-700' :
                    m.estado === 'Mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{m.estado}</span>
                </td>
                <td className="p-3 text-sm">{m.direccion || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">No hay resultados</div>
        )}
      </div>
    </div>
  );
}