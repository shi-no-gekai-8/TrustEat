import Report from "../models/Report.js";
import Device from "../models/Device.js";

export async function startReport(req, res) {
  try {
    const { deviceId } = req.params;
    const device = await Device.findOne({ deviceId: deviceId });
    if (!device)
      return res.status(404).json({ error: "Dispositivo non trovato" });
    device.isWaitingForReport = true;
    await device.save();
    console.log(
      `📡 [API] Dispositivo ${deviceId} messo in ascolto per report.`,
    );
    res.json({ message: "Dispositivo in ascolto. Invia dati ora." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function checkStatus(req, res) {
  try {
    const { deviceId } = req.params;
    const device = await Device.findOne({ deviceId });

    if (!device.isWaitingForReport) {
      const latestReport = await Report.findOne({ device: device._id })
        .sort({ createdAt: -1 })
        .limit(1);
      if (
        latestReport &&
        Date.now() - new Date(latestReport.createdAt).getTime() < 20000
      ) {
        return res.json({ status: "COMPLETED", report: latestReport });
      }
    }
    return res.json({ status: "WAITING" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
