import crypto from "crypto";
import Device from "../models/Device.js";
import SensorData from "../models/SensorData.js";

function verifySignature(publicKeyPEM, message, signatureBase64) {
  try {
    const verify = crypto.createVerify("sha256");
    verify.update(message);
    verify.end();
    return verify.verify(publicKeyPEM, Buffer.from(signatureBase64, "base64"));
  } catch (error) {
    console.error("Errore verifica firma:", error); // Corretto 'err' in 'error'
    return false;
  }
}

export async function handleSensorMessage(topic, payload) {
  try {
    const data = JSON.parse(payload.toString());

    // ---------------------------------------------------------
    // GESTIONE BOOTSTRAP
    // ---------------------------------------------------------
    if (topic === "devices/bootstrap") {
      const { deviceId, pubKey, nonce } = data;
      if (!deviceId || !pubKey || !nonce) {
        console.warn("❌ Bootstrap payload incompleto");
        return;
      }

      let device = await Device.findOne({ deviceId });

      // Se il device non esiste nel DB, lo ignoriamo (o potresti crearlo qui se volessi)
      if (!device) {
        console.warn(`❌ Device ${deviceId} non registrato nella piattaforma`);
        return;
      }

      // MODIFICA 1: Aggiorniamo la chiave ANCHE se è già attivo.
      // Questo gestisce i riavvii dell'ESP32 che generano nuove chiavi.
      const oldKey = device.publicKey;
      device.publicKey = pubKey;

      // Se era pending lo attiviamo, altrimenti rimane active/revoked quello che era
      if (device.status === "pending") {
        device.status = "active";
        device.provisionedAt = new Date();
      }

      device.lastSeen = new Date();
      await device.save();

      if (oldKey && oldKey !== pubKey) {
        console.log(
          `gf🔄 Device ${deviceId} RI-attivato con NUOVA chiave pubblica`,
        );
      } else {
        console.log(`🟢 Device ${deviceId} attivato/aggiornato`);
      }
      return;
    }

    // ---------------------------------------------------------
    // GESTIONE DATI SENSORI
    // ---------------------------------------------------------
    if (topic === "devices/data") {
      const { device: deviceId, temp, hum, ts, signature } = data;

      const deviceDoc = await Device.findOne({ deviceId });
      if (!deviceDoc || deviceDoc.status !== "active") {
        console.warn(`❌ Device ${deviceId} non attivo o non trovato`);
        return;
      }

      // Controllo anti-replay
      const messageAge = Date.now() - ts * 1000;
      if (Math.abs(messageAge) > 60000) {
        // 60 secondi tolleranza
        console.warn(`❌ Timestamp non valido (diff: ${messageAge}ms)`);
        return;
      }

      // MODIFICA 2: Formattazione decimale forzata
      // L'ESP32 usa String(val, 1), quindi dobbiamo assicurarci di avere ".0" se intero
      const tStr = parseFloat(temp).toFixed(1);
      const hStr = parseFloat(hum).toFixed(1);

      // Ricostruiamo la stringa canonica ESATTAMENTE come sull'ESP32
      const canonical = `device=${deviceId}&temp=${tStr}&hum=${hStr}&ts=${ts}`;

      // Debug utile: decommenta se la firma fallisce ancora
      // console.log(`🔍 Verifica Backend: Stringa='${canonical}'`);

      const valid = verifySignature(deviceDoc.publicKey, canonical, signature);

      if (!valid) {
        console.warn(`❌ Firma non valida per ${deviceId}`);
        // console.log("Chiave usata:", deviceDoc.publicKey); // Debug
        deviceDoc.integrityViolations =
          (deviceDoc.integrityViolations || 0) + 1;
        await deviceDoc.save();
        return;
      }

      // Salvataggio dati
      await SensorData.create({
        deviceId: deviceDoc._id,
        temperature: temp, // Nel DB salviamo il numero puro
        humidity: hum,
        timestamp: new Date(ts * 1000),
      });

      deviceDoc.lastSeen = new Date();
      await deviceDoc.save();

      console.log(`📥 Dati validi da ${deviceId}: ${tStr}°C, ${hStr}%`);
    }
  } catch (err) {
    console.error("❌ Errore handleSensorMessage:", err);
  }
}
