import Agriturismo from "../models/Agriturismo.js";
import Device from "../models/Device.js";
import { hashPassword } from "../utils/password.js";

export async function registerAgriturismo(req, res) {
  console.log("--- 🟢 INIZIO RICHIESTA REGISTRAZIONE ---");
  console.log("📦 Dati ricevuti nel body:", JSON.stringify(req.body, null, 2));

  try {
    const { name, description, address, ownerName, email, password, devices } =
      req.body;

    // 1. Test Validazione
    console.log("1️⃣ Verifica campi obbligatori...");
    if (
      !name ||
      !address ||
      !ownerName ||
      !email ||
      !password ||
      !Array.isArray(devices) ||
      devices.length === 0
    ) {
      console.warn(
        "⚠️ Validazione fallita: Campi mancanti o devices non è un array.",
      );
      return res.status(400).json({ error: "Dati mancanti o non validi" });
    }

    // 2. Controllo Email (Possibile punto di blocco se il DB è offline)
    console.log("2️⃣ Controllo email esistente nel database...");
    const existing = await Agriturismo.findOne({ email });
    console.log("✅ Controllo email completato. Esiste già?", !!existing);

    if (existing) {
      return res.status(409).json({ error: "Email già registrata" });
    }

    // 3. Controllo Devices
    console.log("3️⃣ Controllo duplicati dispositivi...");
    const existingDevices = await Device.find({ deviceId: { $in: devices } });
    console.log(`✅ Trovati ${existingDevices.length} dispositivi duplicati.`);

    if (existingDevices.length > 0) {
      return res.status(409).json({
        error: "Uno o più device sono già registrati",
        duplicates: existingDevices.map((d) => d.deviceId),
      });
    }

    // 4. Hashing Password
    console.log("4️⃣ Esecuzione hashing password...");
    const passwordHash = await hashPassword(password);

    // 5. Creazione Agriturismo
    console.log("5️⃣ Creazione record Agriturismo...");
    const agriturismo = await Agriturismo.create({
      name,
      description,
      address,
      ownerName,
      email,
      passwordHash,
    });
    console.log("✅ Agriturismo creato con ID:", agriturismo._id);

    // 6. Creazione Dispositivi
    console.log(`6️⃣ Creazione di ${devices.length} documenti Device...`);
    const deviceDocs = await Promise.all(
      devices.map((deviceId) => {
        console.log(`   - Creazione device: ${deviceId}`);
        return Device.create({
          deviceId,
          agriturismoId: agriturismo._id,
          status: "pending",
        });
      }),
    );

    // 7. Salvataggio finale
    console.log("7️⃣ Aggiornamento riferimenti dispositivi nell'agriturismo...");
    agriturismo.devices = deviceDocs.map((d) => d._id);
    await agriturismo.save();

    console.log("🏁 Operazione completata con successo. Invio risposta 201.");
    return res.status(201).json({
      message: "Agriturismo registrato correttamente",
      agriturismoId: agriturismo._id,
      name: agriturismo.name,
      email: agriturismo.email,
      devices: deviceDocs.map((d) => ({
        deviceId: d.deviceId,
        status: d.status,
      })),
    });
  } catch (error) {
    console.error("❌ ERRORE CRITICO DURANTE LA REGISTRAZIONE:");
    console.error(error); // Logga l'intero oggetto errore per vedere lo stack trace

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Dati non validi",
        details: error.message,
      });
    }

    return res.status(500).json({ error: "Errore server" });
  }
}
