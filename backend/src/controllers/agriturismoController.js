import Agriturismo from "../models/Agriturismo.js";
import Device from "../models/Device.js";
import SensorData from "../models/SensorData.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

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

    const token = generateToken({
      id: agriturismo._id.toString(),
      email: agriturismo.email,
    });

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

export async function getDashboardData(req, res) {
  try {
    const agriturismoId = req.params.id;

    // Verifica che l'utente autenticato stia accedendo ai propri dati
    if (agriturismoId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Non autorizzato ad accedere a questa risorsa" });
    }

    // Recupera l'agriturismo con tutti i device popolati
    const agriturismo = await Agriturismo.findById(agriturismoId)
      .populate("devices")
      .select("-passwordHash");

    if (!agriturismo) {
      return res.status(404).json({ error: "Agriturismo non trovato" });
    }

    // Recupera le statistiche dei device
    const devicesWithStats = await Promise.all(
      agriturismo.devices.map(async (device) => {
        // Ultimi dati del sensore
        const latestData = await SensorData.findOne({ deviceId: device._id })
          .sort({ timestamp: -1 })
          .limit(1);

        // Dati delle ultime 24 ore
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentData = await SensorData.find({
          deviceId: device._id,
          timestamp: { $gte: last24Hours },
        }).sort({ timestamp: -1 });

        // Calcola medie
        const avgTemp =
          recentData.length > 0
            ? recentData.reduce((sum, d) => sum + d.temperature, 0) /
              recentData.length
            : null;
        const avgHum =
          recentData.length > 0
            ? recentData.reduce((sum, d) => sum + d.humidity, 0) /
              recentData.length
            : null;

        return {
          _id: device._id,
          deviceId: device.deviceId,
          status: device.status,
          lastSeen: device.lastSeen,
          integrityViolations: device.integrityViolations,
          latestReading: latestData
            ? {
                temperature: latestData.temperature,
                humidity: latestData.humidity,
                timestamp: latestData.timestamp,
              }
            : null,
          stats24h: {
            dataPoints: recentData.length,
            avgTemperature: avgTemp ? avgTemp.toFixed(1) : null,
            avgHumidity: avgHum ? avgHum.toFixed(1) : null,
          },
        };
      }),
    );

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
        totalIntegrityViolations: devicesWithStats.reduce(
          (sum, d) => sum + d.integrityViolations,
          0,
        ),
      },
    });
  } catch (error) {
    console.error("❌ Errore getDashboardData:", error);
    return res.status(500).json({ error: "Errore server" });
  }
}

export async function getDeviceHistory(req, res) {
  try {
    const { deviceId } = req.params;
    const { hours = 24 } = req.query;

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: "Device non trovato" });
    }

    // Verifica ownership
    if (device.agriturismoId.toString() !== req.user.id) {
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
