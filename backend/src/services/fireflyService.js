import axios from "axios";
import crypto from "crypto";

const FIREFLY_HOST = "http://127.0.0.1:5000";
const NAMESPACE = "default";
const API_NAME = "TrustEat_Final";
const METHOD_NAME = "registerProof";

export async function saveProofOnBlockchain(deviceId, publicKeyPEM) {
  try {
    const hash = crypto.createHash("sha256").update(publicKeyPEM).digest("hex");
    const hashSecretBytes32 = "0x" + hash;
    console.log(
      `🔗 [Blockchain] Invio hash per ${deviceId}: ${hashSecretBytes32}`,
    );

    const contractArgs = {
      deviceId: deviceId,
      hashSecret: hashSecretBytes32,
    };

    const response = await axios.post(
      `${FIREFLY_HOST}/api/v1/namespaces/${NAMESPACE}/apis/${API_NAME}/invoke/${METHOD_NAME}`,
      {
        input: contractArgs,
        options: {
          confirm: false,
        },
      },
    );
    console.log(`✅ [Blockchain] Transazione inviata! ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ [Blockchain] Errore:",
      error.response ? error.response.data : error.message,
    );
  }
}
