const About: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-600">
        <h1 className="text-2xl font-bold text-red-700">Acerca de</h1>
        <p className="text-gray-600 mt-2 text-sm">
          <strong>SETAR Yacuiba</strong> - Sistema de Geolocalización de
          Medidores de Luz Eléctrica.
        </p>
        <p className="text-gray-500 mt-4 text-xs">
          Versión 1.0 - 2026
        </p>
      </div>
    </div>
  );
};

export default About;