import axios from "axios";

const FIREFLY_URL = "http://localhost:5000";
const NAMESPACE = "default";

export async function registerDeviceOnChain({
  deviceId,
  hashSecret,
  timestamp,
  backendSignature,
}) {
  const body = {
    namespace: NAMESPACE,
    operation: "registerProof",
    input: {
      _deviceId: deviceId,
      _hashSecret: hashSecret,
      _timestamp: timestamp,
      _backendSignature: backendSignature,
    },
  };

  const res = await axios.post(
    `${FIREFLY_URL}/api/v1/contracts/DeviceCertification/invoke`,
    body,
  );
  return res.data;
}
