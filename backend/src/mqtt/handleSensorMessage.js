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
    console.error("Errore verifica firma:", err);
    return false;
  }
}

export async function handleSensorMessage(topic, payload) {
  try {
    const data = JSON.parse(payload.toString()); // ✅ Parsing corretto

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

      if (device.status !== "pending") {
        console.warn(`⚠️ Device ${deviceId} già attivato`);
        return;
      }

      device.publicKey = pubKey;
      device.status = "active";
      device.provisionedAt = new Date();
      device.lastSeen = new Date();
      await device.save();

      console.log(`🟢 Device ${deviceId} attivato con chiave pubblica`);
      return;
    }

    if (topic === "devices/data") {
      const { device: deviceId, temp, hum, ts, signature } = data;

      const deviceDoc = await Device.findOne({ deviceId });
      if (!deviceDoc || deviceDoc.status !== "active") {
        console.warn(`❌ Device ${deviceId} non attivo`);
        return;
      }

      // ✅ Controllo anti-replay
      const messageAge = Date.now() - ts * 1000;
      if (Math.abs(messageAge) > 60000) {
        console.warn(`❌ Timestamp non valido (diff: ${messageAge}ms)`);
        return;
      }

      // Ricostruiamo la stringa canonica
      const canonical = `device=${deviceId}&temp=${temp}&hum=${hum}&ts=${ts}`;

      const valid = verifySignature(deviceDoc.publicKey, canonical, signature);
      if (!valid) {
        console.warn(`❌ Firma non valida per ${deviceId}`);
        deviceDoc.integrityViolations += 1;
        await deviceDoc.save();
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

      console.log(`📥 Dati validi da ${deviceId}: ${temp}°C, ${hum}%`);
    }
  } catch (err) {
    console.error("❌ Errore handleSensorMessage:", err);
  }
}
