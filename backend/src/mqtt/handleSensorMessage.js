import crypto from "crypto";
import Device from "../models/Device.js";
import SensorData from "../models/SensorData.js";
import Report from "../models/Report.js"; // 👈 NUOVO IMPORT
import Agriturismo from "../models/Agriturismo.js";
import { saveProofOnBlockchain } from "../services/fireflyService.js";

function verifySignature(publicKeyPEM, message, signatureBase64) {
  try {
    const verify = crypto.createVerify("sha256");
    verify.update(message);
    verify.end();
    return verify.verify(publicKeyPEM, Buffer.from(signatureBase64, "base64"));
  } catch (error) {
    console.error("Errore verifica firma:", error);
    return false;
  }
}

export async function handleSensorMessage(topic, payload) {
  try {
    const data = JSON.parse(payload.toString());

    // =================================================================
    // 1. BOOTSTRAP (Registrazione Dispositivo)
    // =================================================================
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
      if (oldKey === pubKey) {
        console.log(
          `✅ [Bootstrap] Device ${deviceId} riavviato. Chiave invariata (Skip Blockchain).`,
        );

        if (device.status === "pending") {
          device.status = "active";
          device.provisionedAt = new Date();
        }

        device.lastSeen = new Date();
        await device.save();
        return;
      }

      console.log(
        `gf🔄 [Bootstrap] Device ${deviceId} registrato con NUOVA chiave pubblica`,
      );
      device.publicKey = pubKey;

      if (device.status === "pending") {
        device.status = "active";
        device.provisionedAt = new Date();
      }

      device.lastSeen = new Date();
      await device.save();

      console.log(
        `🔗 [Blockchain] Avvio registrazione NUOVA prova per ${deviceId}...`,
      );
      saveProofOnBlockchain(deviceId, pubKey)
        .then(async (tx) => {
          if (tx) {
            console.log(`⛓️ [Blockchain] Identità salvata! TX ID: ${tx.id}`);
            device.blockchainTxId = tx.id;
            await device.save();

            // Boost Trust Index (solo per nuove registrazioni/cambi chiave)
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

    // =================================================================
    // 2. DATA (Ricezione Dati Sensore)
    // =================================================================
    if (topic === "devices/data") {
      const { device: deviceId, temp, hum, ts, signature } = data;

      const deviceDoc = await Device.findOne({ deviceId });
      if (!deviceDoc || deviceDoc.status !== "active") {
        console.warn(`❌ Device ${deviceId} non attivo o non trovato`);
        return;
      }

      // Check Anti-Replay
      const messageAge = Date.now() - ts * 1000;
      if (Math.abs(messageAge) > 60000) {
        console.warn(`❌ Timestamp non valido (diff: ${messageAge}ms)`);
        return;
      }

      // Validazione Firma
      const tStr = parseFloat(temp).toFixed(1);
      const hStr = parseFloat(hum).toFixed(1);
      const canonical = `device=${deviceId}&temp=${tStr}&hum=${hStr}&ts=${ts}`;
      const isSignatureValid = verifySignature(
        deviceDoc.publicKey,
        canonical,
        signature,
      );

      // A) Se NON stiamo aspettando un report, gestiamo le violazioni standard
      if (!deviceDoc.isWaitingForReport) {
        if (!isSignatureValid) {
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
              (agriturismo.integrityViolations || 0) + 1;
            agriturismo.trustIndex = Math.max(0, agriturismo.trustIndex - 20);
            await agriturismo.save();
          }
          return;
        }
      }

      // Se arriviamo qui, o la firma è valida, oppure è invalida MA stiamo generando un report (che registrerà l'errore)

      // Salvataggio dato grezzo (SensorData) - Lo facciamo sempre per i grafici
      await SensorData.create({
        deviceId: deviceDoc._id,
        temperature: temp,
        humidity: hum,
        timestamp: new Date(ts * 1000),
      });

      deviceDoc.lastSeen = new Date();

      // ============================================================
      // 🚨 LOGICA REPORT (Se l'agriturismo ha cliccato "Pubblica Report")
      // ============================================================
      if (deviceDoc.isWaitingForReport) {
        console.log(`📝 [Report] Generazione report per ${deviceId}...`);

        let blockchainTxId = null;
        let integrityStatus = isSignatureValid ? "VERIFIED" : "TAMPERED";

        // Calcoliamo Hash del payload (Prova crittografica dei dati ricevuti)
        const payloadHash = crypto
          .createHash("sha256")
          .update(canonical)
          .digest("hex");
        // Nota: FireFly accetta stringhe, ma se il contratto vuole bytes32, assicurati del formato.
        // Qui passiamo l'hash dei DATI come "segreto"

        try {
          // ⛓️ SCRITTURA SU BLOCKCHAIN
          const tx = await saveProofOnBlockchain(deviceId, "0x" + payloadHash);
          if (tx) blockchainTxId = tx.id;
        } catch (err) {
          console.error("❌ [Report] Errore Blockchain:", err);
        }

        if (blockchainTxId) {
          // Trova Agriturismo
          const agri = await Agriturismo.findOne({ devices: deviceDoc._id });

          // Crea Report Ufficiale
          await Report.create({
            agriturismo: agri ? agri._id : null,
            device: deviceDoc._id,
            temperature: temp,
            humidity: hum,
            timestamp: new Date(ts * 1000),
            integrityStatus: integrityStatus,
            blockchainTxId: blockchainTxId,
            dataHash: payloadHash,
          });

          console.log(`✅ [Report] Pubblicato! Status: ${integrityStatus}`);

          // Disattiva modalità ascolto
          deviceDoc.isWaitingForReport = false;

          // Aggiorna Trust Index (Premio o Punizione)
          if (agri) {
            if (integrityStatus === "VERIFIED") {
              agri.trustIndex = 100; // Boost Massimo
              agri.lastReportAt = new Date();
            } else {
              agri.trustIndex = Math.max(0, agri.trustIndex - 50); // Penalità Severa
              console.warn("📉 [Trust] Crollo indice per report manomesso");
            }
            await agri.save();
          }
        }
      }

      await deviceDoc.save();

      // Logica Trust Index standard (Mantenimento) - Solo se non era un report
      if (!deviceDoc.isWaitingForReport && isSignatureValid) {
        const agriturismo = await Agriturismo.findOne({
          devices: deviceDoc._id,
        });
        if (agriturismo) {
          agriturismo.lastReportAt = new Date();
          if (agriturismo.trustIndex < 100) {
            agriturismo.trustIndex = Math.min(100, agriturismo.trustIndex + 1);
          }
          await agriturismo.save();
        }
      }

      console.log(`📥 Dati processati da ${deviceId}: ${tStr}°C, ${hStr}%`);
    }
  } catch (err) {
    console.error("❌ Errore handleSensorMessage:", err);
  }
}
