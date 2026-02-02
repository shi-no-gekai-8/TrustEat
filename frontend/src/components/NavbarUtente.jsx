// FILE: src/components/NavbarUtente.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

function NavbarUtente() {
  const navigate = useNavigate();
  // Nota: Lasciamo il localStorage così com'è per ora
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/"); // Torna alla selezione iniziale
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>🛡️ TrustEat</div>
      
      <div style={styles.menu}>
        {/* Ho cambiato il link in /bacheca per distinguerlo dalla Home generica */}
        <Link to="/bacheca" style={styles.link}>Bacheca</Link>

        <Link to="/scrivi" style={styles.link}>✍️ Scrivi Segnalazione</Link>

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
    marginBottom: "20px"
  },
  logo: { fontSize: "24px", fontWeight: "bold" },
  menu: { display: "flex", gap: "20px", alignItems: "center" },
  link: { color: "white", textDecoration: "none", fontSize: "18px" },
  button: {
    backgroundColor: "#e74c3c", color: "white", border: "none",
    padding: "8px 15px", borderRadius: "5px", cursor: "pointer"
  }
};

export default NavbarUtente;