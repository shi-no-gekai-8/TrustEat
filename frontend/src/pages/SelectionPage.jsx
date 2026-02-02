import React from 'react';
import { useNavigate } from 'react-router-dom'; // Serve per cambiare pagina

const SelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">Benvenuto su TrustEat</h1>
      <p className="mb-8 text-gray-600">Chi sei?</p>
      
      <div className="flex gap-10">
        
        {/* Quadratino UTENTE */}
        <div 
          onClick={() => navigate('/login-utente')} 
          className="w-48 h-48 bg-white shadow-lg rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:scale-105 transition duration-300 border border-gray-200"
        >
          <span className="text-4xl mb-4">👤</span> {/* Qui potrai mettere un'icona vera */}
          <h2 className="text-xl font-semibold text-blue-600">Utente</h2>
        </div>

        {/* Quadratino AGRITURISMO */}
        <div 
          onClick={() => navigate('/login-agriturismo')} 
          className="w-48 h-48 bg-white shadow-lg rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 hover:scale-105 transition duration-300 border border-gray-200"
        >
          <span className="text-4xl mb-4">🚜</span> {/* Qui potrai mettere un'icona vera */}
          <h2 className="text-xl font-semibold text-green-600">Agriturismo</h2>
        </div>

      </div>
    </div>
  );
};

export default SelectionPage;