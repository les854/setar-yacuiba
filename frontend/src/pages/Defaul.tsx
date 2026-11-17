const Default: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm p-10 text-center border-l-4 border-red-600">
        <i className="fa-solid fa-circle-exclamation text-red-500 text-5xl mb-4"></i>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Página no encontrada
        </h1>
        <p className="text-gray-500 text-sm">
          La ruta que intentas acceder no existe.
        </p>
      </div>
    </div>
  );
};

export default Default;