const MiConsumo: React.FC = () => {
  const consumos = [
    { mes: "Enero", kwh: 120 },
    { mes: "Febrero", kwh: 135 },
    { mes: "Marzo", kwh: 128 },
    { mes: "Abril", kwh: 145 },
    { mes: "Mayo", kwh: 160 },
    { mes: "Junio", kwh: 155 },
    { mes: "Julio", kwh: 170 },
    { mes: "Agosto", kwh: 145 },
    { mes: "Septiembre", kwh: 132 },
    { mes: "Octubre", kwh: 140 },
    { mes: "Noviembre", kwh: 150 },
    { mes: "Diciembre", kwh: 145 },
  ];

  const maximo = Math.max(...consumos.map((c) => c.kwh));
  const promedio = consumos.reduce((sum, c) => sum + c.kwh, 0) / consumos.length;
  const ALTURA_MAX = 220; // pixeles

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          <i className="fa-solid fa-chart-line mr-2"></i>
          Mi Consumo Eléctrico
        </h1>
        <p className="text-red-100 text-sm mt-1">Historial de consumo mensual (kWh)</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600">
          <p className="text-sm text-gray-500">Consumo Actual</p>
          <h3 className="text-2xl font-bold text-gray-800">145 kWh</h3>
          <p className="text-xs text-red-600 mt-1">
            <i className="fa-solid fa-bolt mr-1"></i>
            Último mes registrado
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600">
          <p className="text-sm text-gray-500">Promedio Mensual</p>
          <h3 className="text-2xl font-bold text-gray-800">{promedio.toFixed(0)} kWh</h3>
          <p className="text-xs text-gray-500 mt-1">
            <i className="fa-solid fa-chart-line mr-1"></i>
            De los 12 meses
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600">
          <p className="text-sm text-gray-500">Consumo Máximo</p>
          <h3 className="text-2xl font-bold text-gray-800">{maximo} kWh</h3>
          <p className="text-xs text-gray-500 mt-1">
            <i className="fa-solid fa-arrow-up mr-1"></i>
            Julio 2026
          </p>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6">Consumo por Mes (2026)</h3>

        {/* Contenedor del gráfico */}
        <div style={{ position: "relative", height: `${ALTURA_MAX + 40}px` }}>
          {/* Líneas guías */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 40, borderBottom: "1px solid #e5e7eb" }}></div>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderBottom: "1px dashed #e5e7eb" }}></div>

          {/* Barras */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: `${ALTURA_MAX}px`, gap: "8px", position: "absolute", bottom: 40, left: 0, right: 0 }}>
            {consumos.map((c, i) => {
              const altura = (c.kwh / maximo) * ALTURA_MAX;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  {/* Valor arriba de la barra */}
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>
                    {c.kwh}
                  </span>
                  {/* Barra */}
                  <div
                    style={{
                      width: "100%",
                      height: `${altura}px`,
                      background: "linear-gradient(to top, #b91c1c, #ef4444)",
                      borderRadius: "6px 6px 0 0",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
                    }}
                    title={`${c.mes}: ${c.kwh} kWh`}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Etiquetas de los meses (abajo) */}
          <div style={{ display: "flex", justifyContent: "space-between", position: "absolute", bottom: 0, left: 0, right: 0, height: "40px", gap: "8px" }}>
            {consumos.map((c, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <span style={{ fontSize: "10px", color: "#6b7280", fontWeight: "600" }}>
                  {c.mes.substring(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Detalle Mensual</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-xs uppercase">
              <th className="py-3 px-6 text-left">Mes</th>
              <th className="py-3 px-6 text-right">Consumo (kWh)</th>
              <th className="py-3 px-6 text-right">Variación</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {consumos.map((c, i) => {
              const anterior = i > 0 ? consumos[i - 1].kwh : c.kwh;
              const variacion = ((c.kwh - anterior) / anterior) * 100;
              return (
                <tr key={i} className="border-t border-gray-100 hover:bg-red-50/40">
                  <td className="py-3 px-6 font-medium">{c.mes}</td>
                  <td className="py-3 px-6 text-right font-mono font-semibold">{c.kwh}</td>
                  <td className={`py-3 px-6 text-right font-semibold ${
                    variacion > 0 ? "text-red-600" : variacion < 0 ? "text-green-600" : "text-gray-500"
                  }`}>
                    {variacion > 0 ? "+" : ""}{variacion.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MiConsumo;