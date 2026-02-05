import React from "react";
import { useNavigate } from "react-router-dom";

const SelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Logo */}
      <div className="mb-8">
        <img src="/logoComplete.png" alt="TrustEat" className="w-24 h-24" />
      </div>

      {/* Titolo */}
      <h1 className="text-5xl font-bold mb-3 text-emerald-900">TrustEat</h1>
      <p className="mb-16 text-emerald-700 text-base font-medium">
        Scegli come accedere
      </p>

      {/* Cards */}
      <div className="flex gap-8">
        {/* Card UTENTE */}
        <div
          onClick={() => navigate("/login-utente")}
          className="group w-56 h-72 bg-white/80 backdrop-blur-sm shadow-lg border-2 border-emerald-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
            👤
          </div>
          <h2 className="text-2xl font-semibold text-emerald-800 mb-2">
            Utente
          </h2>
          <p className="text-sm text-emerald-600">Esplora e condividi</p>
        </div>

        {/* Card AGRITURISMO */}
        <div
          onClick={() => navigate("/login-agriturismo")}
          className="group w-56 h-72 bg-white/80 backdrop-blur-sm shadow-lg border-2 border-emerald-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
            🚜
          </div>
          <h2 className="text-2xl font-semibold text-emerald-800 mb-2">
            Agriturismo
          </h2>
          <p className="text-sm text-emerald-600">Gestisci la tua attività</p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-emerald-600 text-sm font-medium">
        Food & Trust Platform
      </div>
    </div>
  );
};

export default SelectionPage;
