import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  User,
  Mail,
  Lock,
  FileText,
  Cpu,
  Plus,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const AgriturismoSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [devices, setDevices] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleDeviceChange = (index, value) => {
    const newDevices = [...devices];
    newDevices[index] = value;
    setDevices(newDevices);
  };

  const addDeviceField = () => {
    setDevices([...devices, ""]);
  };

  const removeDeviceField = (index) => {
    if (devices.length > 1) {
      setDevices(devices.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.address ||
      !formData.ownerName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Tutti i campi obbligatori devono essere compilati");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Inserisci un indirizzo email valido");
      return false;
    }

    if (formData.password.length < 8) {
      setError("La password deve essere di almeno 8 caratteri");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Le password non coincidono");
      return false;
    }

    const validDevices = devices.filter((d) => d.trim() !== "");
    if (validDevices.length === 0) {
      setError("Devi aggiungere almeno un dispositivo");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const validDevices = devices.filter((d) => d.trim() !== "");

      const response = await fetch(
        "http://localhost:5002/api/agriturismi/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            devices: validDevices,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la registrazione");
      }

      // Salva il token nel localStorage
      localStorage.setItem("token", data.token);

      setSuccess(true);

      // Reindirizzamento dopo 2 secondi
      setTimeout(() => {
        navigate(`/dashboard/${data.agriturismoId}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Registrazione Completata!
          </h2>
          <p className="text-gray-600 mb-6">
            Il tuo agriturismo è stato registrato con successo. Verrai
            reindirizzato alla dashboard...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Registra il tuo Agriturismo
          </h1>
          <p className="text-gray-600">
            Inserisci i dati per iniziare a monitorare i tuoi dispositivi IoT
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informazioni Agriturismo */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                Informazioni Agriturismo
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Agriturismo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Es. Agriturismo Le Colline"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Descrivi il tuo agriturismo..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indirizzo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Es. Via Roma 123, Salerno"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Informazioni Proprietario */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Dati Proprietario
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Es. Mario Rossi"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="mario@agriturismo.it"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="Minimo 8 caratteri"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conferma Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="Ripeti la password"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dispositivi IoT */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-green-600" />
                  Dispositivi IoT
                </h2>
                <button
                  type="button"
                  onClick={addDeviceField}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi
                </button>
              </div>

              <div className="space-y-3">
                {devices.map((device, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Cpu className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={device}
                        onChange={(e) =>
                          handleDeviceChange(index, e.target.value)
                        }
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        placeholder="Es. esp32-dht11-01"
                      />
                    </div>
                    {devices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDeviceField(index)}
                        className="px-3 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500">
                Inserisci gli ID dei dispositivi che vuoi associare al tuo
                agriturismo (es. esp32-dht11-01)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registrazione in corso...
                </>
              ) : (
                "Registra Agriturismo"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 mt-6">
          Hai già un account?{" "}
          <a
            href="/login"
            className="text-green-600 font-semibold hover:text-green-700"
          >
            Accedi qui
          </a>
        </p>
      </div>
    </div>
  );
};

export default AgriturismoSignup;
