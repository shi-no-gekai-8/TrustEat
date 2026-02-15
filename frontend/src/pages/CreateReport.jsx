import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wifi,
  Radio,
  CheckCircle2,
  XCircle,
  Thermometer,
  Droplets,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Cpu,
} from "lucide-react";

const PORT = process.env.REACT_APP_PORT;

const CreateReport = () => {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [step, setStep] = useState("SELECT"); // Stati: SELECT | LISTENING | SUCCESS | ERROR | TIMEOUT
  const [reportResult, setReportResult] = useState(null);
  const [error, setError] = useState("");

  const goBackToDashboard = () => {
    const storedSession = localStorage.getItem("user");
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);

      const agriturismoId =
        sessionData.id || sessionData._id || sessionData.agriturismo?.id;
      if (agriturismoId) {
        navigate(`/dashboard/${agriturismoId}`);
      } else {
        console.error("ID Agriturismo non trovato nella sessione");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line
  }, []);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userStr);

      const response = await fetch(
        `http://localhost:${PORT}/api/agriturismi/dashboard/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Errore caricamento dispositivi");

      const data = await response.json();

      // Filtriamo solo i device attivi che possono trasmettere
      const activeDevices = (data.devices || []).filter(
        (d) => d.status === "active",
      );
      setDevices(activeDevices);
    } catch (err) {
      setError("Impossibile caricare la lista dei dispositivi. " + err.message);
    }
  };

  // 2. Avvia la modalità ascolto
  const startListening = async () => {
    if (!selectedDevice) return;

    setStep("LISTENING");
    setError("");

    try {
      const token = localStorage.getItem("token");

      // A) Diciamo al backend: "Mettiti in attesa su questo device"
      const res = await fetch(
        `http://localhost:${PORT}/api/report/${selectedDevice.deviceId}/start-report`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Errore comunicazione backend");

      let attempts = 0;
      const maxAttempts = 30; // 30 secondi di timeout

      const interval = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await fetch(
            `http://localhost:${PORT}/api/report/${selectedDevice.deviceId}/check-status`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (pollRes.ok) {
            const pollData = await pollRes.json();

            // Se lo status è COMPLETED, il report è stato generato
            if (pollData.status === "COMPLETED") {
              clearInterval(interval);
              setReportResult(pollData.report);

              // Decidiamo se mostrare la schermata Verde (Verified) o Rossa (Tampered)
              if (pollData.report.integrityStatus === "VERIFIED") {
                setStep("SUCCESS");
              } else {
                setStep("ERROR"); // Integrità fallita
              }
            }
          }

          // Se passa troppo tempo senza dati
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setStep("TIMEOUT");
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1000); // Check ogni 1 secondo
    } catch (err) {
      setStep("SELECT");
      setError("Errore avvio procedura: " + err.message);
    }
  };

  // --- RENDERERS DEI VARI STEP ---

  // STEP 1: Selezione Device
  const renderSelection = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Genera Nuovo Report
        </h2>
        <p className="text-gray-500">
          Seleziona il sensore da cui vuoi acquisire e certificare i dati in
          tempo reale.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((dev) => (
          <div
            key={dev._id}
            onClick={() => setSelectedDevice(dev)}
            className={`p-5 border-2 rounded-xl cursor-pointer transition-all flex items-center space-x-4 relative overflow-hidden ${
              selectedDevice?._id === dev._id
                ? "border-green-500 bg-green-50 shadow-md transform scale-[1.02]"
                : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
            }`}
          >
            <div
              className={`p-3 rounded-full flex-shrink-0 ${selectedDevice?._id === dev._id ? "bg-green-100" : "bg-gray-100"}`}
            >
              <Cpu
                className={`w-6 h-6 ${selectedDevice?._id === dev._id ? "text-green-600" : "text-gray-500"}`}
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{dev.deviceId}</h3>
              <p className="text-xs text-gray-500 font-mono">
                ID: {dev._id.slice(-8)}
              </p>
            </div>
            {selectedDevice?._id === dev._id && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      {devices.length === 0 && !error && (
        <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Wifi className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">
            Nessun dispositivo attivo trovato.
          </p>
        </div>
      )}

      <div className="flex justify-end mt-8 border-t pt-6">
        <button
          disabled={!selectedDevice}
          onClick={startListening}
          className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all flex items-center ${
            selectedDevice
              ? "bg-green-600 hover:bg-green-700 hover:shadow-green-500/30 hover:-translate-y-0.5"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <Radio className="w-5 h-5 mr-2" />
          Avvia Ascolto
        </button>
      </div>
    </div>
  );

  // STEP 2: In Ascolto (Radar Animation)
  const renderListening = () => (
    <div className="flex flex-col items-center justify-center py-16 animate-in zoom-in duration-300">
      {/* Radar Animation */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 duration-1000"></div>
        <div className="absolute inset-2 bg-green-500 rounded-full animate-ping opacity-40 delay-150 duration-1000"></div>
        <div className="relative bg-white p-8 rounded-full shadow-2xl border-4 border-green-100 z-10">
          <Wifi className="w-16 h-16 text-green-600 animate-pulse" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        In attesa di dati...
      </h2>
      <p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">
        Il sistema è connesso al dispositivo <br />
        <span className="font-mono text-green-700 bg-green-50 px-2 py-1 rounded mx-1">
          {selectedDevice?.deviceId}
        </span>
        <br />
        Invia ora un dato dal sensore per generare la prova.
      </p>

      <div className="flex items-center space-x-3 text-sm font-medium text-gray-500 bg-gray-100 px-5 py-2.5 rounded-full border border-gray-200">
        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
        <span>Sincronizzazione Blockchain attiva</span>
      </div>
    </div>
  );

  // STEP 3: Successo (Report OK)
  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <ShieldCheck className="w-12 h-12 text-green-600" />
      </div>

      <h2 className="text-3xl font-bold text-green-800 mb-2">
        Report Certificato!
      </h2>
      <p className="text-gray-500 mb-10 text-center">
        L'integrità dei dati è stata verificata e salvata su Blockchain.
      </p>

      {/* Card Dati */}
      <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-lg w-full max-w-md mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>

        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <span className="text-gray-500 text-sm font-medium">TIMESTAMP</span>
          <span className="font-mono text-gray-700 text-sm">
            {new Date(reportResult?.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-xl flex flex-col items-center border border-green-100">
            <Thermometer className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-3xl font-bold text-gray-800">
              {reportResult?.temperature}°
            </span>
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider mt-1">
              Temp
            </span>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl flex flex-col items-center border border-blue-100">
            <Droplets className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-3xl font-bold text-gray-800">
              {reportResult?.humidity}%
            </span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider mt-1">
              Humidity
            </span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono break-all relative group cursor-help">
          <div className="flex items-center space-x-2 mb-2 text-green-400 font-bold uppercase tracking-wider text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Blockchain Proof Hash</span>
          </div>
          <p className="text-gray-300 leading-relaxed">
            {reportResult?.blockchainTxId}
          </p>
        </div>
      </div>

      <button
        onClick={goBackToDashboard}
        className="self-start flex items-center text-gray-500 hover:text-gray-800 mb-8 transition font-medium group"
      >
        <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow mr-3">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Torna alla Dashboard
      </button>
    </div>
  );

  // STEP 4: Errore (Timeout o Manomissione)
  const renderError = (isTimeout) => (
    <div className="flex flex-col items-center justify-center py-10 animate-in shake duration-300">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner ${isTimeout ? "bg-yellow-100" : "bg-red-100"}`}
      >
        {isTimeout ? (
          <Clock className="w-12 h-12 text-yellow-600" />
        ) : (
          <XCircle className="w-12 h-12 text-red-600" />
        )}
      </div>

      <h2
        className={`text-3xl font-bold mb-2 ${isTimeout ? "text-yellow-700" : "text-red-700"}`}
      >
        {isTimeout ? "Tempo Scaduto" : "DATI MANOMESSI"}
      </h2>

      <p className="text-gray-600 mb-8 text-center max-w-md leading-relaxed">
        {isTimeout
          ? "Non abbiamo ricevuto dati dal dispositivo entro 30 secondi. Verifica che il sensore sia acceso e connesso alla rete."
          : "ATTENZIONE: La firma digitale dei dati ricevuti NON è valida. È stata generata una prova di manomissione immutabile sulla blockchain."}
      </p>

      {/* Se è manomesso, mostriamo comunque la prova TX */}
      {!isTimeout && reportResult && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-5 w-full max-w-md mb-8 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold text-red-800 uppercase tracking-wide">
                Prova di Violazione (TX ID)
              </p>
              <p className="text-xs text-red-700 mt-2 font-mono break-all bg-white p-2 rounded border border-red-100">
                {reportResult.blockchainTxId}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => {
            setStep("SELECT");
            setSelectedDevice(null);
          }}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
        >
          Riprova
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-white hover:border-gray-400 font-medium transition"
        >
          Annulla
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Header di Navigazione */}
        <button
          onClick={goBackToDashboard}
          className="self-start flex items-center text-gray-500 hover:text-gray-800 mb-8 transition font-medium group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow mr-3">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Torna alla Dashboard
        </button>

        {/* Card Principale */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 flex-1 flex flex-col justify-center min-h-[600px]">
          {step === "SELECT" && renderSelection()}
          {step === "LISTENING" && renderListening()}
          {step === "SUCCESS" && renderSuccess()}
          {(step === "ERROR" || step === "TIMEOUT") &&
            renderError(step === "TIMEOUT")}
        </div>
      </div>
    </div>
  );
};

export default CreateReport;
