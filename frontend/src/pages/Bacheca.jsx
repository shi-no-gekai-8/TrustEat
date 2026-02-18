// FILE: src/pages/Bacheca.js
import React, { useState, useEffect } from "react";
import axios from "axios";
// IMPORTA LA NUOVA NAVBAR
import NavbarUtente from "../components/NavbarUtente";

const PORT = process.env.REACT_APP_PORT;

function Bacheca() {
  const [messaggi, setMessaggi] = useState([]);
  // Questo serve per gestire il testo del commento per ogni singolo messaggio
  const [commentiInput, setCommentiInput] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  // Funzione per caricare i messaggi dal server
  const caricaMessaggi = async () => {
    try {
      const res = await axios.get(`http://localhost:${PORT}/api/bacheca/leggi`);
      setMessaggi(res.data);
    } catch (error) {
      console.error("Errore caricamento messaggi:", error);
    }
  };

  // Carica i messaggi appena si apre la pagina
  useEffect(() => {
    caricaMessaggi();
  }, []);

  // Funzione per inviare un commento
  const inviaCommento = async (idMessaggio) => {
    const testoRisposta = commentiInput[idMessaggio];
    if (!testoRisposta) return;

    try {
      await axios.put(
        `http://localhost:${PORT}/api/bacheca/rispondi/${idMessaggio}`,
        {
          walletAddress: user ? user.walletAddress : "Anonimo",
          risposta: testoRisposta,
        },
      );
      // Pulisce la casella di testo specifica di quel messaggio
      setCommentiInput({ ...commentiInput, [idMessaggio]: "" });
      // Ricarica per vedere il nuovo commento
      caricaMessaggi();
    } catch (error) {
      alert("Errore nell'invio del commento");
      console.error(error);
    }
  };

  return (
    <div>
      <NavbarUtente />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h2>📢 Ultime Segnalazioni</h2>

        {messaggi.length === 0 && <p>Nessuna segnalazione presente.</p>}

        {messaggi.map((msg) => (
          <div
            key={msg._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            {/* IL MESSAGGIO PRINCIPALE */}
            <h3 style={{ margin: "0 0 10px 0" }}>{msg.testo}</h3>
            <small style={{ color: "gray" }}>
              Autore: {msg.autore ? msg.autore.slice(0, 6) : "Anonimo"}... |{" "}
              {new Date(msg.dataCreazione).toLocaleString()}
            </small>

            <hr style={{ margin: "15px 0", border: "0.5px solid #eee" }} />

            {/* LISTA RISPOSTE */}
            <div
              style={{
                backgroundColor: "#f9f9f9",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <h4>Risposte:</h4>
              {msg.risposte.length === 0 && (
                <p style={{ fontSize: "12px" }}>Nessuna risposta ancora.</p>
              )}

              {msg.risposte.map((risposta, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: "1px solid #eee",
                    padding: "5px 0",
                    fontSize: "14px",
                  }}
                >
                  <strong>
                    {risposta.autoreRisposta
                      ? risposta.autoreRisposta.slice(0, 4)
                      : "??"}
                    ..
                  </strong>
                  : {risposta.testoRisposta}
                </div>
              ))}

              {/* CAMPO PER SCRIVERE RISPOSTA */}
              <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Scrivi un commento..."
                  value={commentiInput[msg._id] || ""}
                  onChange={(e) =>
                    setCommentiInput({
                      ...commentiInput,
                      [msg._id]: e.target.value,
                    })
                  }
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
                <button
                  onClick={() => inviaCommento(msg._id)}
                  style={{
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    padding: "0 15px",
                  }}
                >
                  Invia
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Bacheca;
