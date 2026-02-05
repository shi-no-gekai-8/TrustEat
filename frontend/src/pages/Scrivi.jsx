// FILE: src/pages/Scrivi.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavbarUtente from "../components/NavbarUtente";

const PORT = process.env.PORT;

function Scrivi() {
  const [testo, setTesto] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const pubblica = async () => {
    if (!testo) return alert("Scrivi qualcosa!");

    // Controllo di sicurezza: se l'utente non è loggato, evita crash
    if (!user || !user.walletAddress) {
      alert("Sessione scaduta o utente non loggato.");
      navigate("/login-utente");
      return;
    }

    try {
      await axios.post(`http://localhost:${PORT}/api/bacheca/scrivi`, {
        walletAddress: user.walletAddress,
        testo: testo,
      });

      alert("Messaggio inviato!");
      navigate("/bacheca");
    } catch (error) {
      console.error(error);
      alert(
        `Errore nell'invio. Verifica che il server (porta ${PORT}) sia acceso.`,
      );
    }
  };

  return (
    <div>
      <NavbarUtente />

      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1>✍️ Nuova Segnalazione</h1>
        <p>Il tuo messaggio sarà anonimo e durerà 24 ore.</p>

        <textarea
          rows="6"
          placeholder="Descrivi il problema..."
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "16px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={pubblica}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Pubblica e Torna alla Bacheca
        </button>
      </div>
    </div>
  );
}

export default Scrivi;
