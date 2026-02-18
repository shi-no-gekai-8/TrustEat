import Agriturismo from "../models/Agriturismo.js";
import Device from "../models/Device.js";
import SensorData from "../models/SensorData.js";
import Report from "../models/Report.js"; // 👈 IMPORTANTE: Importiamo i Report
import jwt from "jsonwebtoken"; // <--- NUOVO IMPORT
import { hashPassword, verifyPassword } from "../utils/password.js";

// ==================================================================
// 1. REGISTRAZIONE AGRITURISMO
// ==================================================================
// 1. REGISTRAZIONE AGRITURISMO
export async function registerAgriturismo(req, res) {
  console.log("--- 🟢 INIZIO RICHIESTA REGISTRAZIONE ---");
  console.log("📦 Dati ricevuti nel body:", JSON.stringify(req.body, null, 2));

  try {
    const { name, description, address, ownerName, email, password, devices } =
      req.body;

    // Test Validazione
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

    // 2. Controllo Email
    // Controllo Email
    console.log("2️⃣ Controllo email esistente nel database...");
    const existing = await Agriturismo.findOne({ email });
    console.log("✅ Controllo email completato. Esiste già?", !!existing);

    if (existing) {
      return res.status(409).json({ error: "Email già registrata" });
    }

    // Controllo Devices
    console.log("3️⃣ Controllo duplicati dispositivi...");
    const existingDevices = await Device.find({ deviceId: { $in: devices } });
    console.log(`✅ Trovati ${existingDevices.length} dispositivi duplicati.`);

    if (existingDevices.length > 0) {
      return res.status(409).json({
        error: "Uno o più device sono già registrati",
        duplicates: existingDevices.map((d) => d.deviceId),
      });
    }

    // Hashing Password
    console.log("4️⃣ Esecuzione hashing password...");
    const passwordHash = await hashPassword(password);

    // Creazione Agriturismo
    console.log("5️⃣ Creazione record Agriturismo...");
    const agriturismo = await Agriturismo.create({
      name,
      description,
      address,
      ownerName,
      email,
      passwordHash,
      trustIndex: 50, // Valore iniziale di default
    });
    console.log("✅ Agriturismo creato con ID:", agriturismo._id);

    // Creazione Dispositivi
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

    // 7. Salvataggio finale riferimenti
    // Salvataggio finale
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
    console.error("❌ ERRORE CRITICO DURANTE LA REGISTRAZIONE:", error);
    console.error("❌ ERRORE CRITICO DURANTE LA REGISTRAZIONE:");
    console.error(error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Dati non validi", details: error.message });
    }
    return res.status(500).json({ error: "Errore server" });
  }
}

// ==================================================================
// 2. LOGIN AGRITURISMO
// ==================================================================
// 2. LOGIN AGRITURISMO (MODIFICATO PER USARE .ENV)
export async function loginAgriturismo(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e password richiesti" });
    }

    const agriturismo = await Agriturismo.findOne({ email });
    if (!agriturismo) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const isValid = await verifyPassword(password, agriturismo.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    // --- MODIFICA FONDAMENTALE QUI SOTTO ---
    // Ora usiamo jwt.sign leggendo la chiave segreta dal file .env
    const token = jwt.sign(
      {
        id: agriturismo._id.toString(),
        email: agriturismo.email,
        role: "agriturismo",
      },
      process.env.JWT_SECRET, // <--- LEGGE DAL .ENV
      { expiresIn: "24h" },
    );
    // ---------------------------------------

    return res.json({
      message: "Login effettuato con successo",
      token,
      agriturismo: {
        id: agriturismo._id,
        name: agriturismo.name,
        email: agriturismo.email,
        address: agriturismo.address,
        ownerName: agriturismo.ownerName,
      },
    });
  } catch (error) {
    console.error("❌ Errore login:", error);
    return res.status(500).json({ error: "Errore server" });
  }
}

// ==================================================================
// 3. DASHBOARD DATA (AGGIORNATA CON LOGICHE TRUST & REPORT)
// ==================================================================
// 3. DATI DASHBOARD
export async function getDashboardData(req, res) {
  try {
    const agriturismoId = req.params.id;

    // 1. Verifica Autorizzazione
    // Nota: Assicurati che il middleware 'authenticate' popoli req.user
    if (req.user && agriturismoId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Non autorizzato ad accedere a questa risorsa" });
    }

    // 2. Recupera l'Agriturismo
    const agriturismo = await Agriturismo.findById(agriturismoId)
      .populate("devices")
      .select("-passwordHash");

    if (!agriturismo) {
      return res.status(404).json({ error: "Agriturismo non trovato" });
    }

    // 3. Recupera Dati e Statistiche per ogni Device
    const devicesWithStats = await Promise.all(
      agriturismo.devices.map(async (device) => {
        // Ultimi dati del sensore
        const latestData = await SensorData.findOne({ deviceId: device._id })
          .sort({ timestamp: -1 })
          .limit(1);

        // Dati delle ultime 24 ore per le statistiche
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentData = await SensorData.find({
          deviceId: device._id,
          timestamp: { $gte: last24Hours },
        }).sort({ timestamp: -1 });

        // Calcola medie (arrotondate a 1 decimale)
        const avgTemp =
          recentData.length > 0
            ? (
                recentData.reduce((sum, d) => sum + d.temperature, 0) /
                recentData.length
              ).toFixed(1)
            : null;

        const avgHum =
          recentData.length > 0
            ? (
                recentData.reduce((sum, d) => sum + d.humidity, 0) /
                recentData.length
              ).toFixed(1)
            : null;

        return {
          _id: device._id,
          deviceId: device.deviceId,
          status: device.status,
          lastSeen: device.lastSeen,
          integrityViolations: device.integrityViolations || 0,
          blockchainTxId: device.blockchainTxId, // 🛡️ FONDAMENTALE PER IL FRONTEND

          latestReading: latestData
            ? {
                temperature: latestData.temperature,
                humidity: latestData.humidity,
                timestamp: latestData.timestamp,
              }
            : null,

          stats24h: {
            dataPoints: recentData.length,
            avgTemperature: avgTemp,
            avgHumidity: avgHum,
          },
        };
      }),
    );

    // 4. Recupera i Report Certificati (Ultimi 10)
    const reports = await Report.find({ agriturismo: agriturismoId })
      .sort({ timestamp: -1 })
      .limit(10);

    // 5. Calcola totali per Summary Cards
    const totalViolations =
      (agriturismo.integrityViolations || 0) +
      devicesWithStats.reduce((sum, d) => sum + d.integrityViolations, 0);

    // 6. Costruisci la risposta finale
    return res.json({
      agriturismo: {
        id: agriturismo._id,
        name: agriturismo.name,
        description: agriturismo.description,
        address: agriturismo.address,
        ownerName: agriturismo.ownerName,
        email: agriturismo.email,
        isActive: agriturismo.isActive,
        isVerified: agriturismo.isVerified,

        // Trust Metrics
        trustIndex: agriturismo.trustIndex,
        lastReportAt: agriturismo.lastReportAt,
        missedReports: agriturismo.missedReports,
        integrityViolations: agriturismo.integrityViolations,
      },

      devices: devicesWithStats,

      summary: {
        totalDevices: agriturismo.devices.length,
        activeDevices: devicesWithStats.filter((d) => d.status === "active")
          .length,
        pendingDevices: devicesWithStats.filter((d) => d.status === "pending")
          .length,
        totalIntegrityViolations: totalViolations,
        totalIntegrityViolations: devicesWithStats.reduce(
          (sum, d) => sum + d.integrityViolations,
          0,
        ),
      },

      reports: reports, // 👈 La lista che popolerà la nuova sezione
    });
  } catch (error) {
    console.error("❌ Errore getDashboardData:", error);
    return res.status(500).json({ error: "Errore server" });
  }
}

// ==================================================================
// 4. STORICO DISPOSITIVO (GRAFICI)
// ==================================================================
// 4. STORICO DISPOSITIVI
export async function getDeviceHistory(req, res) {
  try {
    const { deviceId } = req.params;
    const { hours = 24 } = req.query;

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: "Device non trovato" });
    }

    // Verifica ownership (controlla sempre che req.user sia popolato dal middleware)
    if (req.user && device.agriturismoId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Non autorizzato" });
    }

    const timeRange = new Date(Date.now() - hours * 60 * 60 * 1000);
    const data = await SensorData.find({
      deviceId: device._id,
      timestamp: { $gte: timeRange },
    }).sort({ timestamp: 1 });

    return res.json({
      deviceId: device.deviceId,
      dataPoints: data.length,
      data: data.map((d) => ({
        temperature: d.temperature,
        humidity: d.humidity,
        timestamp: d.timestamp,
      })),
    });
  } catch (error) {
    console.error("❌ Errore getDeviceHistory:", error);
    return res.status(500).json({ error: "Errore server" });
  }
}
