import crypto from "crypto";
import Device from "../models/Device.js";
import SensorData from "../models/SensorData.js";
import { saveProofOnBlockchain } from "../services/fireflyService.js";
import Agriturismo from "../models/Agriturismo.js";

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
    if (topic === "devices/bootstrap") {
      const { deviceId, pubKey, nonce } = data;
      if (!deviceId || !pubKey || !nonce) {
        console.warn("❌ Bootstrap payload incompleto");
        return;
      }

      let device = await Device.findOne({ deviceId });
      if (!device) {
        console.warn(`❌ Device ${deviceId} non registrato nella piattaforma`);
        return;
      }
      const oldKey = device.publicKey;
      device.publicKey = pubKey;
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

      console.log(
        `🔗 [Blockchain] Avvio registrazione prova per ${deviceId}...`,
      );
      saveProofOnBlockchain(deviceId, pubKey)
        .then(async (tx) => {
          if (tx) {
            console.log(`⛓️ [Blockchain] Prova salvata! TX ID: ${tx.id}`);
            device.blockchainTxId = tx.id;
            await device.save();
            const agriturismo = await Agriturismo.findOne({
              devices: device._id,
            });
            if (agriturismo) {
              console.log(`🚀 [Trust] Boost a 100% per ${agriturismo.name}`);
              agriturismo.trustIndex = 100;
              agriturismo.lastTrustUpdate = new Date();
              agriturismo.isVerified = true;
              await agriturismo.save();
            }
          }
        })
        .catch((err) =>
          console.error("⚠️ [Blockchain] Errore salvataggio:", err),
        );
      return;
    }
    if (topic === "devices/data") {
      const { device: deviceId, temp, hum, ts, signature } = data;

      const deviceDoc = await Device.findOne({ deviceId });
      if (!deviceDoc || deviceDoc.status !== "active") {
        console.warn(`❌ Device ${deviceId} non attivo o non trovato`);
        return;
      }
      const messageAge = Date.now() - ts * 1000;
      if (Math.abs(messageAge) > 60000) {
        console.warn(`❌ Timestamp non valido (diff: ${messageAge}ms)`);
        return;
      }

      const tStr = parseFloat(temp).toFixed(1);
      const hStr = parseFloat(hum).toFixed(1);
      const canonical = `device=${deviceId}&temp=${tStr}&hum=${hStr}&ts=${ts}`;

      const valid = verifySignature(deviceDoc.publicKey, canonical, signature);

      if (!valid) {
        console.warn(`❌ Firma non valida per ${deviceId}`);
        deviceDoc.integrityViolations =
          (deviceDoc.integrityViolations || 0) + 1;
        await deviceDoc.save();
        const agriturismo = await Agriturismo.findOne({
          devices: deviceDoc._id,
        });
        if (agriturismo) {
          console.warn(
            `📉 [Trust] Penalità applicata a ${agriturismo.name} per firma invalida (-20)`,
          );
          agriturismo.integrityViolations =
            agriturismo.integrityViolations || 0;
          agriturismo.trustIndex = Math.max(0, agriturismo.trustIndex - 20);
          await agriturismo.save();
        }
        return;
      }

      await SensorData.create({
        deviceId: deviceDoc._id,
        temperature: temp,
        humidity: hum,
        timestamp: new Date(ts * 1000),
      });

      deviceDoc.lastSeen = new Date();
      await deviceDoc.save();

      const agriturismo = await Agriturismo.findOne({ devices: deviceDoc._id });
      if (agriturismo) {
        agriturismo.lastReportAt = new Date();
        if (agriturismo.trustIndex < 100) {
          agriturismo.trustIndex = Math.min(100, agriturismo.trustIndex + 1);
        }
        await agriturismo.save();
      }

      console.log(`📥 Dati validi da ${deviceId}: ${tStr}°C, ${hStr}%`);
    }
  } catch (err) {
    console.error("❌ Errore handleSensorMessage:", err);
  }
}
