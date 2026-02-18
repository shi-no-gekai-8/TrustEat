import React, { useState, useEffect, useCallback, useRef } from "react";
import NavbarUtente from "../components/NavbarUtente";
import { UserPlus, Check, X, Search, MessageSquare, Send } from "lucide-react";

function ChatPage() {
  // --- STATI GENERALI ---
  const token = localStorage.getItem("token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- STATI SINISTRA (Lista Amici, Ricerca, Richieste) ---
  const [amici, setAmici] = useState([]);
  const [richieste, setRichieste] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // --- STATI DESTRA (Chat Attiva) ---
  const [selectedFriend, setSelectedFriend] = useState(null); // L'amico con cui sto parlando
  const [messages, setMessages] = useState([]);               // Lista messaggi
  const [newMessageText, setNewMessageText] = useState("");   // Testo input
  const messagesEndRef = useRef(null);                        // Per lo scroll automatico

  // Configurazione Header
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // 1. CARICAMENTO DATI (Amici e Richieste)
  const fetchDati = useCallback(async () => {
    try {
      // Richieste pendenti
      const resReq = await fetch("http://localhost:5000/api/connections/pending", { headers: authHeaders });
      if (resReq.ok) setRichieste(await resReq.json());

      // Lista Amici
      const resAmici = await fetch("http://localhost:5000/api/connections/friends", { headers: authHeaders });
      if (resAmici.ok) setAmici(await resAmici.json());

    } catch (err) {
      console.error("Errore polling dati:", err);
    }
  }, [token]);

  // Polling Dati (ogni 5 sec)
  useEffect(() => {
    fetchDati();
    const interval = setInterval(fetchDati, 5000);
    return () => clearInterval(interval);
  }, [fetchDati]);


  // 2. LOGICA CHAT (Carica messaggi e Auto-Refresh)
  const fetchMessages = useCallback(async () => {
    if (!selectedFriend) return;

    try {
      const res = await fetch(`http://localhost:5000/api/chat/${selectedFriend.friendId}`, {
        headers: authHeaders
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Errore recupero messaggi:", err);
    }
  }, [selectedFriend, token]);

  // Polling Messaggi (ogni 3 sec quando una chat è aperta)
  useEffect(() => {
    if (selectedFriend) {
      fetchMessages();
      const chatInterval = setInterval(fetchMessages, 3000);
      return () => clearInterval(chatInterval);
    }
  }, [selectedFriend, fetchMessages]);

  // Scroll automatico in basso all'arrivo di nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // 3. INVIA MESSAGGIO
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Evita il refresh della pagina
    if (!newMessageText.trim() || !selectedFriend) return;

    try {
      const res = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          recipientId: selectedFriend.friendId,
          text: newMessageText
        })
      });

      if (res.ok) {
        setNewMessageText(""); // Pulisci input
        fetchMessages();       // Ricarica subito
      } else {
        alert("Errore invio messaggio");
      }
    } catch (err) {
      console.error(err);
    }
  };


  // --- FUNZIONI UTILI (Ricerca, Gestione Richieste) ---
  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 3) {
      setError("Scrivi almeno 3 lettere.");
      return;
    }
    setError(""); setSuccess(""); setLoadingSearch(true); setSearchResults([]);

    try {
      const res = await fetch(`http://localhost:5000/api/connections/search?q=${searchTerm}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data);
        if (data.length === 0) setError("Nessun risultato.");
      } else setError("Errore ricerca.");
    } catch (err) { setError("Errore server."); } finally { setLoadingSearch(false); }
  };

  const inviaRichiesta = async (id, model) => {
    try {
      const res = await fetch("http://localhost:5000/api/connections/request", {
        method: "POST", headers: authHeaders, body: JSON.stringify({ recipientId: id, recipientModel: model })
      });
      if (res.ok) { setSuccess("Richiesta inviata!"); setSearchResults([]); fetchDati(); }
      else { const d = await res.json(); setError(d.error); }
    } catch (e) { setError("Errore invio."); }
  };

  const gestisciRichiesta = async (id, action) => {
    try {
      const endpoint = action === "accept" ? "accept" : "reject";
      await fetch(`http://localhost:5000/api/connections/${endpoint}`, {
        method: "POST", headers: authHeaders, body: JSON.stringify({ connectionId: id })
      });
      fetchDati(); // Ricarica liste
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ backgroundColor: "#f4f7f6", height: "100vh", display: "flex", flexDirection: "column" }}>
      <NavbarUtente />

      <div style={{ flex: 1, maxWidth: "1200px", width: "100%", margin: "20px auto", display: "flex", gap: "20px", padding: "0 20px", boxSizing: "border-box", overflow: "hidden" }}>
        
        {/* === COLONNA SINISTRA: MENU COMPLETO (Ricerca + Richieste + Amici) === */}
        <div style={{ width: "350px", backgroundColor: "white", borderRadius: "10px", display: "flex", flexDirection: "column", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          
          {/* Sezione Superiore: Ricerca */}
          <div style={{ padding: "15px", borderBottom: "1px solid #eee", backgroundColor: "#fafafa" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>💬 Contatti</h3>
            
            <div style={{ display: "flex", gap: "5px" }}>
              <input 
                type="text" placeholder="Cerca nuovo contatto..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ddd" }}
              />
              <button onClick={handleSearch} style={{ background: "#3498db", color: "white", border: "none", borderRadius: "5px", width: "35px", cursor: "pointer" }}>
                {loadingSearch ? ".." : <Search size={18}/>}
              </button>
            </div>
            
            {/* Risultati Ricerca */}
            {searchResults.length > 0 && (
               <div style={{ marginTop: "10px", maxHeight: "150px", overflowY: "auto", border: "1px solid #eee", backgroundColor: "white" }}>
                 {searchResults.map(res => (
                   <div key={res.id} style={{ padding: "8px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                     <span>{res.name}</span>
                     <button onClick={() => inviaRichiesta(res.id, res.type)} style={{ background: "#27ae60", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}><UserPlus size={14}/></button>
                   </div>
                 ))}
               </div>
            )}
            
            {error && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{error}</p>}
            {success && <p style={{ color: "green", fontSize: "12px", marginTop: "5px" }}>{success}</p>}
          </div>

          {/* Sezione: Richieste Pendenti */}
          {richieste.length > 0 && (
            <div style={{ backgroundColor: "#fff8e1", padding: "10px", borderBottom: "1px solid #eee" }}>
              <small style={{fontWeight: "bold", color: "#856404"}}>🔔 Richieste in attesa:</small>
              {richieste.map(req => (
                <div key={req._id} style={{ display: "flex", justifyContent: "space-between", marginTop: "5px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px" }}>{req.requester.name || "Utente"}</span>
                  <div style={{ display: "flex", gap: "5px"}}>
                    <button onClick={() => gestisciRichiesta(req._id, "accept")} style={{ background: "#28a745", border: "none", borderRadius: "3px", color: "white", cursor: "pointer" }}><Check size={14}/></button>
                    <button onClick={() => gestisciRichiesta(req._id, "reject")} style={{ background: "#dc3545", border: "none", borderRadius: "3px", color: "white", cursor: "pointer" }}><X size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sezione: Lista Amici (Cliccabili per aprire la chat) */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {amici.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#999" }}>
                <MessageSquare size={30} style={{opacity: 0.3, marginBottom: "10px"}}/>
                <p style={{fontSize: "13px"}}>Nessun contatto.<br/>Usa la ricerca per aggiungere qualcuno.</p>
              </div>
            ) : (
              amici.map(amico => (
                <div 
                  key={amico.connectionId}
                  onClick={() => setSelectedFriend(amico)}
                  style={{ 
                    padding: "15px", 
                    borderBottom: "1px solid #f0f0f0", 
                    cursor: "pointer", 
                    backgroundColor: selectedFriend?.friendId === amico.friendId ? "#e3f2fd" : "white",
                    display: "flex", alignItems: "center", gap: "10px",
                    transition: "background-color 0.2s"
                  }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#555" }}>
                    {amico.name ? amico.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>{amico.name}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>{amico.type}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* === COLONNA DESTRA: FINESTRA DI CHAT === */}
        <div style={{ flex: 1, backgroundColor: "white", borderRadius: "10px", display: "flex", flexDirection: "column", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          
          {selectedFriend ? (
            <>
              {/* Header Chat */}
              <div style={{ padding: "15px", borderBottom: "1px solid #eee", backgroundColor: "#f9f9f9", display: "flex", alignItems: "center", gap: "10px" }}>
                 <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: "#27ae60", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {selectedFriend.name.charAt(0)}
                 </div>
                 <div>
                    <div style={{ fontWeight: "bold" }}>{selectedFriend.name}</div>
                    <div style={{ fontSize: "11px", color: "green" }}>● Chat Sicura & Criptata</div>
                 </div>
              </div>

              {/* Area Messaggi */}
              <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#fff", backgroundImage: "radial-gradient(#f1f1f1 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "#ccc", marginTop: "50px" }}>
                        <p>Inizia la conversazione con {selectedFriend.name}!</p>
                        <small>🔒 I messaggi sono protetti da crittografia end-to-end simulata.</small>
                    </div>
                )}
                
                {messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    style={{ 
                      alignSelf: msg.isMe ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      padding: "10px 15px",
                      borderRadius: "15px",
                      borderBottomRightRadius: msg.isMe ? "2px" : "15px",
                      borderBottomLeftRadius: msg.isMe ? "15px" : "2px",
                      backgroundColor: msg.isMe ? "#dcf8c6" : "#ffffff",
                      color: "#333",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      border: "1px solid #e5e5e5"
                    }}
                  >
                    <div style={{ wordBreak: "break-word" }}>{msg.text}</div>
                    <div style={{ fontSize: "10px", color: "#999", textAlign: "right", marginTop: "4px" }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} style={{ padding: "15px", borderTop: "1px solid #eee", display: "flex", gap: "10px", backgroundColor: "#f9f9f9" }}>
                <input 
                  type="text" 
                  placeholder="Scrivi un messaggio..." 
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  style={{ flex: 1, padding: "12px", borderRadius: "25px", border: "1px solid #ccc", outline: "none" }}
                />
                <button type="submit" style={{ backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "50%", width: "45px", height: "45px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            // Placeholder (Nessuna chat selezionata)
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#bbb", backgroundColor: "#f8f9fa" }}>
              <MessageSquare size={60} style={{ opacity: 0.1, marginBottom: "20px" }} />
              <h3>Seleziona un contatto</h3>
              <p style={{ maxWidth: "300px", textAlign: "center", fontSize: "14px" }}>
                Scegli un amico dalla lista a sinistra per iniziare a chattare in sicurezza.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ChatPage;