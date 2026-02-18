import { useState } from "react";
import { createAgriturismo } from "../services/agriturismoApi";

const AgriturismoForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    ownerName: "",
    contactEmail: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await createAgriturismo(formData);
      setSuccess(true);
      setFormData({
        name: "",
        description: "",
        address: "",
        ownerName: "",
        contactEmail: "",
      });
    } catch (err) {
      setError("Errore nella creazione dell’agriturismo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Nuovo Agriturismo</h2>

      <input
        type="text"
        name="name"
        placeholder="Nome agriturismo"
        value={formData.name}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="text"
        name="address"
        placeholder="Indirizzo"
        value={formData.address}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="text"
        name="ownerName"
        placeholder="Nome proprietario"
        value={formData.ownerName}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="email"
        name="contactEmail"
        placeholder="Email di contatto"
        value={formData.contactEmail}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <textarea
        name="description"
        placeholder="Descrizione"
        value={formData.description}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        {loading ? "Salvataggio..." : "Crea Agriturismo"}
      </button>

      {success && (
        <p className="text-green-600 mt-3">
          Agriturismo creato con successo ✅
        </p>
      )}

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </form>
  );
};

export default AgriturismoForm;
