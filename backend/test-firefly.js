import axios from "axios";

const FIREFLY_HOST = "http://127.0.0.1:5000";
const NAMESPACE = "default";

async function checkFireflyConnection() {
  console.log("📡 1. Test connessione a Firefly Core...");

  try {
    const res = await axios.get(`${FIREFLY_HOST}/api/v1/namespaces`);
    if (res.status === 200) {
      console.log("✅ Firefly è ACCESO e risponde!");
      console.log(
        `   Namespace trovati: ${res.data.map((n) => n.name).join(", ")}`,
      );
    }
  } catch (error) {
    console.error("❌ ERRORE: Firefly non risponde sulla porta 5000.");
    console.error(
      "   Controlla che lo stack sia avviato ('ff start iot-stack').",
    );
    console.error(
      "   Controlla che il tuo backend NON stia usando la porta 5000.",
    );
    return;
  }
  console.log("\n📡 2. Test visibilità Smart Contract (API)...");
  try {
    const apiName = "DeviceCertification";
    const res = await axios.get(
      `${FIREFLY_HOST}/api/v1/namespaces/${NAMESPACE}/apis/${apiName}`,
    );
    if (res.status === 200) {
      console.log(`✅ API Contratto '${apiName}' TROVATA!`);
      console.log("   Endpoint di invocazione pronto.");
      console.log("   Tutto pronto per salvare le prove in blockchain. 🚀");
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("❌ ERRORE: Firefly risponde, ma NON trova il contratto.");
      console.error("   Hai fatto 'Generate API' nella Sandbox?");
      console.error(
        "   Il nome dell'API nello script corrisponde a quello nella Sandbox?",
      );
    } else {
      console.error("❌ Errore generico:", error.message);
    }
  }
}

checkFireflyConnection();
