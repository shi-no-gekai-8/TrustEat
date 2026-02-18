import mqtt from "mqtt";
import { handleSensorMessage } from "./handleSensorMessage.js";

const MQTT_HOST = "3b0b75f2b7104a52ba5cd2d40715db39.s1.eu.hivemq.cloud";
const MQTT_PORT = 8883;
const MQTT_USER = "esp32_user";
const MQTT_PASS = "7SZi4Wy*&2jP#vHz";
const TOPICS = ["devices/bootstrap", "devices/data"];

const options = {
  host: MQTT_HOST,
  port: MQTT_PORT,
  protocol: "mqtts",
  username: MQTT_USER,
  password: MQTT_PASS,
  rejectUnauthorized: true,
};

const client = mqtt.connect(options);

client.on("connect", () => {
  console.log("✅ Backend connesso a HiveMQ");
  TOPICS.forEach((topic) => {
    client.subscribe(topic, () => {
      console.log(`📡 Iscritto al topic: ${topic}`);
    });
  });
});

client.on("message", async (topic, message) => {
  await handleSensorMessage(topic, message);
});

client.on("error", (err) => {
  console.error("❌ MQTT error:", err);
});

export default client;
