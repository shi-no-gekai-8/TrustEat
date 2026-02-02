import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'; 

// 1. Pagine Comuni
import SelectionPage from './pages/SelectionPage';

// 2. Le TUE Pagine (Utente)
import LoginUtente from './pages/LoginUtente';
import Bacheca from './pages/Bacheca';
import Scrivi from './pages/Scrivi';

// 3. Le Pagine del TUO AMICO (Agriturismo)
// Nota: Se anche queste non esistono ancora, darà errore. 
// Se HomePage e AgriturismoSignup esistono già nel progetto del tuo amico, lasciale.
import HomePage from "./pages/HomePage"; 
import AgriturismoSignup from "./pages/AgriturismoSignup";

// ABBIAMO TOLTO L'IMPORT DI LOGIN AGRITURISMO CHE DAVA ERRORE

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* --- LANDING PAGE (Scelta) --- */}
          <Route path="/" element={<SelectionPage />} />
          
          {/* --- ROTTE UTENTE (Il tuo lavoro) --- */}
          <Route path="/login-utente" element={<LoginUtente />} />
          <Route path="/bacheca" element={<Bacheca />} />
          <Route path="/scrivi" element={<Scrivi />} />

          {/* --- ROTTE AGRITURISMO --- */}
          <Route path="/agriturismo-home" element={<HomePage />} />
          <Route path="/signup/agriturismo" element={<AgriturismoSignup />} />

          {/* --- CORREZIONE QUI SOTTO --- */}
          {/* Invece di caricare il file che non c'è, scriviamo direttamente dell'HTML qui */}
          <Route 
            path="/login-agriturismo" 
            element={
              <div style={{textAlign: 'center', marginTop: '50px'}}>
                <h2>🚧 Lavori in corso 🚧</h2>
                <p>Il login Agriturismo lo sta sviluppando il mio amico!</p>
              </div>
            } 
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;