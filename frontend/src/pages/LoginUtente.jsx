// FILE: src/pages/LoginUtente.js
import React, { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PORT = process.env.REACT_APP_PORT;

function LoginUtente() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const connectWallet = async () => {
    // 1. Controlla se MetaMask c'è
    if (!window.ethereum) {
      alert("Per favore installa MetaMask!");
      return;
    }

    try {
      setLoading(true);

      // 2. Connetti al Wallet dell'utente
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      console.log("Indirizzo:", walletAddress);

      const responseNonce = await axios.post(
        `http://localhost:${PORT}/api/auth/nonce`,
        {
          walletAddress: walletAddress,
        },
      );

      const nonce = responseNonce.data.nonce;

      // 4. FIRMA LA SFIDA CON METAMASK
      const signature = await signer.signMessage(nonce);

      const responseLogin = await axios.post(
        `http://localhost:${PORT}/api/auth/login`,
        {
          walletAddress: walletAddress,
          signature: signature,
        },
      );

      // 6. SE TUTTO OK...
      localStorage.setItem("token", responseLogin.data.token);
      localStorage.setItem("user", JSON.stringify(responseLogin.data.user));

      alert("Login Effettuato! Benvenuto " + walletAddress.slice(0, 6) + "...");

      // Vai alla bacheca
      navigate("/bacheca");
    } catch (error) {
      console.error("Errore Login:", error);

      // Gestione errori per capire se il server è spento
      if (error.code === "ERR_NETWORK") {
        alert(
          `Errore di rete: Il server sulla porta ${PORT} sembra spento o irraggiungibile.`,
        );
      } else {
        alert("Qualcosa è andato storto. Guarda la console (F12).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-24">
      <h1 className="text-3xl font-bold mb-4">Benvenuto su TrustEat</h1>
      <p className="mb-6 text-gray-600">
        Accedi in modo anonimo con il tuo Wallet
      </p>

      <button
        onClick={connectWallet}
        disabled={loading}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          cursor: "pointer",
          backgroundColor: loading ? "#ccc" : "#f6851b",
          color: "white",
          border: "none",
          borderRadius: "10px",
        }}
      >
        {loading ? "Verifica in corso..." : "🦊 Connetti con MetaMask"}
      </button>
    </div>
  );
}

export default LoginUtente;
