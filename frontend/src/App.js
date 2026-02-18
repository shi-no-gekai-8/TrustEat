import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// --- 1. Pagine Comuni ---
import SelectionPage from "./pages/SelectionPage";

// --- 2. Le TUE Pagine (Utente) ---
import LoginUtente from "./pages/LoginUtente";
import Bacheca from "./pages/Bacheca";
import Scrivi from "./pages/Scrivi";

// --- 3. Le Pagine del TUO AMICO (Agriturismo) ---
// Ora includiamo i file veri che sono arrivati col merge
import HomePage from "./pages/HomePage";

import AgriturismoSignup from "./pages/AgriturismoSignup";
import Dashboard from "./pages/Dashboard";
import AgriturismoLogin from "./pages/AgriturismoLogin";
import CreateReport from "./pages/CreateReport";

import ChatPage from "./pages/ChatePage";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* --- LANDING PAGE (Scelta Iniziale) --- */}
          {/* Questa è la pagina con i due quadratini */}
          <Route path="/" element={<SelectionPage />} />
          {/* --- ROTTE UTENTE (Il tuo lavoro) --- */}
          <Route path="/login-utente" element={<LoginUtente />} />
          <Route path="/bacheca" element={<Bacheca />} />
          <Route path="/scrivi" element={<Scrivi />} />
          <Route path="/chat" element={<ChatPage />} />
          {/* --- ROTTE AGRITURISMO (Il lavoro del tuo amico) --- */}
          {/* La home dell'agriturismo la spostiamo su un percorso specifico */}
          <Route path="/agriturismo-home" element={<HomePage />} />
          <Route path="/signup/agriturismo" element={<AgriturismoSignup />} />
          {/* Qui usiamo il VERO login fatto dal tuo amico */}
          {/* Nota: Nel SelectionPage assicurati che il link punti a "/login-agriturismo" */}
          <Route path="/login-agriturismo" element={<AgriturismoLogin />} />
          {/* Anche questa è una rotta del tuo amico */}
          <Route path="/login" element={<AgriturismoLogin />} />{" "}
          {/* Fallback se servisse */}
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/report/nuovo" element={<CreateReport />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
