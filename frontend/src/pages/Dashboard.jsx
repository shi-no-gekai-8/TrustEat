import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  MapPin,
  User,
  Mail,
  ShieldCheck,
  Shield,
  History,
  MessageSquare,
  Info,
  FileText,
  XCircle,
  Thermometer,
  Droplets,
  Plus, // 👈 IMPORTATA NUOVA ICONA
} from "lucide-react";

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5002/api/agriturismi/dashboard/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Errore nel caricamento dei dati");
      }

      const result = await response.json();

      // LOG DI DEBUG
      // console.log("Dati Dashboard ricevuti:", result);

      setData(result);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "revoked":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTrustColorInfo = (score) => {
    if (score >= 90)
      return {
        color: "text-green-700 bg-green-100 border-green-200",
        label: "Eccellente",
      };
    if (score >= 70)
      return {
        color: "text-blue-700 bg-blue-100 border-blue-200",
        label: "Buono",
      };
    if (score >= 50)
      return {
        color: "text-yellow-700 bg-yellow-100 border-yellow-200",
        label: "Medio",
      };
    return { color: "text-red-700 bg-red-100 border-red-200", label: "Basso" };
  };

  const formatDate = (date) => {
    if (!date) return "Mai";
    return new Date(date).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Errore</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Torna al Login
          </button>
        </div>
      </div>
    );
  }

  const trustScore = data?.agriturismo?.trustIndex ?? 0;
  const trustInfo = getTrustColorInfo(trustScore);
  const lastReport = data?.agriturismo?.lastReportAt;
  const reportsList = data?.reports || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Sinistra: Logo + Nome + Trust Index */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-white" />
              </div>

              <div>
                <div className="flex items-center flex-wrap gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {data?.agriturismo?.name}
                  </h1>

                  {/* Badge Trust Index DINAMICO */}
                  <div
                    className={`flex items-center space-x-1.5 px-3 py-0.5 rounded-full border ${trustInfo.color}`}
                  >
                    <Shield className="w-4 h-4 fill-current opacity-20" />
                    <span className="text-sm font-bold">
                      Trust Index: {trustScore}/100
                    </span>
                  </div>
                </div>

                {/* Sottotitolo */}
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>Dashboard di monitoraggio</span>
                  <span className="hidden md:inline text-gray-300">|</span>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <History className="w-3.5 h-3.5" />
                    <span>
                      Ultimo report:{" "}
                      <span className="font-medium text-gray-900">
                        {formatDate(lastReport)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Destra: Pulsanti azioni */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/bacheca")}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Bacheca</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Aggiorna dati"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Esci</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Agriturismo */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Informazioni
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Indirizzo</p>
                <p className="font-medium text-gray-900">
                  {data?.agriturismo?.address}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Proprietario</p>
                <p className="font-medium text-gray-900">
                  {data?.agriturismo?.ownerName}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">
                  {data?.agriturismo?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Dispositivi Totali</p>
              <Cpu className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data?.summary?.totalDevices || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Dispositivi Attivi</p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {data?.summary?.activeDevices || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">In Attesa</p>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {data?.summary?.pendingDevices || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Violazioni Integrità</p>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {data?.summary?.totalIntegrityViolations || 0}
            </p>
          </div>
        </div>

        {/* Devices List (Semplificata) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Dispositivi IoT Registrati
          </h2>
          {data?.devices?.length === 0 ? (
            <div className="text-center py-12">
              <Cpu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nessun dispositivo registrato</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.devices?.map((device) => (
                <div
                  key={device._id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header Dispositivo */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Cpu className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate max-w-[120px]">
                            {device.deviceId}
                          </h3>
                          <p className="text-xs text-gray-500">
                            ID: {device._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}
                      >
                        {getStatusIcon(device.status)}
                        <span className="capitalize">{device.status}</span>
                      </span>
                    </div>

                    {/* Banner Certificazione Blockchain (DINAMICO) */}
                    {device.blockchainTxId ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-start space-x-2">
                          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-semibold text-green-800">
                                Certificato
                              </p>
                              {/* Tooltip */}
                              <div className="relative group">
                                <Info className="w-3.5 h-3.5 text-green-600 cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                                  <p className="font-semibold mb-1">
                                    Identità Verificata
                                  </p>
                                  <p className="mb-2">
                                    Questo dispositivo è autenticato in modo
                                    sicuro su Blockchain.
                                  </p>
                                  <p className="text-xs text-green-300 font-mono break-all">
                                    TX: {device.blockchainTxId}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-green-700 mt-1 truncate font-mono">
                              {device.blockchainTxId}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                        <p className="text-xs text-gray-500">
                          Non certificato su Blockchain
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 pt-3 mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Ultima attività: {formatDate(device.lastSeen)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 👇 SEZIONE STORICO REPORT CERTIFICATI DINAMICA */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Storico Report Certificati
            </h2>
            <div className="flex space-x-3">
              {/* 👇 NUOVO PULSANTE GENERAZIONE REPORT */}
              <button
                onClick={() => navigate("/report/nuovo")} // Indirizza alla pagina di creazione
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Genera Nuovo Report</span>
              </button>

              <button className="text-sm text-green-600 hover:text-green-700 font-medium px-2">
                Vedi tutti
              </button>
            </div>
          </div>

          {reportsList.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                Nessun report generato
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Usa il pulsante in alto per generare il primo report
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportsList.map((report) => (
                <div
                  key={report._id}
                  className={`border rounded-lg p-5 hover:shadow-md transition relative overflow-hidden ${
                    report.integrityStatus === "TAMPERED"
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {/* Intestazione Card */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          report.integrityStatus === "TAMPERED"
                            ? "bg-red-100"
                            : "bg-blue-50"
                        }`}
                      >
                        {report.integrityStatus === "TAMPERED" ? (
                          <XCircle className="w-6 h-6 text-red-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Report #{report._id.slice(-6).toUpperCase()}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(report.timestamp)}
                        </div>
                      </div>
                    </div>
                    {/* Badge Status Integrità */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        report.integrityStatus === "TAMPERED"
                          ? "bg-red-200 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {report.integrityStatus === "TAMPERED"
                        ? "MANOMESSO"
                        : "VERIFICATO"}
                    </span>
                  </div>

                  {/* Dati Snapshot */}
                  <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50/50 p-3 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {report.temperature}°C
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {report.humidity}%
                      </span>
                    </div>
                  </div>

                  {/* Footer Blockchain */}
                  <div
                    className={`rounded-md p-3 text-xs border ${
                      report.integrityStatus === "TAMPERED"
                        ? "bg-white border-red-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {report.integrityStatus === "TAMPERED" ? (
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`font-semibold ${
                              report.integrityStatus === "TAMPERED"
                                ? "text-red-800"
                                : "text-green-800"
                            }`}
                          >
                            {report.integrityStatus === "TAMPERED"
                              ? "Prova di Manomissione"
                              : "Certificato Blockchain"}
                          </p>
                        </div>
                        <p
                          className={`mt-1 font-mono truncate ${
                            report.integrityStatus === "TAMPERED"
                              ? "text-red-700"
                              : "text-green-700"
                          }`}
                        >
                          TX: {report.blockchainTxId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
