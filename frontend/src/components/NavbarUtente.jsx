import React from "react";
import { Link, useNavigate } from "react-router-dom";

function NavbarUtente() {
  const navigate = useNavigate();
  
  // 1. Recuperiamo i dati dell'utente loggato
  const user = JSON.parse(localStorage.getItem("user"));

  // 2. Capiamo chi è loggato
  const isCryptoUser = user && user.walletAddress;
  
  // Agriturismo: ha email/nome E NON ha wallet
  const isAgriturismo = user && (user.email || user.name) && !user.walletAddress;

  // 3. RECUPERO ID "UNIVERSALE"
  // Cerchiamo l'ID sia come "_id" che come "id". Se ne trova uno, lo usa.
  const agriturismoId = user ? (user._id || user.id) : null;

  const logout = () => {
    localStorage.clear();
    navigate("/"); 
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        🛡️ TrustEat 
        {isAgriturismo && <span style={styles.badge}>Agriturismo</span>}
        {isCryptoUser && <span style={styles.badgeUser}>Utente</span>}
      </div>
      
      <div style={styles.menu}>
        <Link to="/bacheca" style={styles.link}>Bacheca</Link>

        {/* --- NUOVO TASTO CHAT (Visibile a tutti) --- */}
        <Link to="/chat" style={styles.link}>
            💬 Chat & Amici
        </Link>
        {/* ------------------------------------------- */}

        {isCryptoUser && (
          <Link to="/scrivi" style={styles.link}>
            ✍️ Scrivi Segnalazione
          </Link>
        )}

        {isAgriturismo && agriturismoId && (
          <Link to={`/dashboard/${agriturismoId}`} style={styles.dashboardBtn}>
            📊 Vai al Pannello
          </Link>
        )}

        <button onClick={logout} style={styles.button}>Esci</button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#2c3e50",
    color: "white",
    marginBottom: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  badge: {
    fontSize: "12px",
    backgroundColor: "#27ae60",
    padding: "2px 8px",
    borderRadius: "10px",
    textTransform: "uppercase",
    color: "white"
  },
  badgeUser: {
    fontSize: "12px",
    backgroundColor: "#f39c12",
    padding: "2px 8px",
    borderRadius: "10px",
    textTransform: "uppercase",
    color: "white"
  },
  menu: {
    display: "flex",
    gap: "20px",
    alignItems: "center"
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "18px",
    transition: "color 0.3s"
  },
  dashboardBtn: {
    backgroundColor: "#27ae60",
    color: "white",
    textDecoration: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  },
  button: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px"
  }
};

export default NavbarUtente;