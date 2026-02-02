const API_URL = "http://localhost:5000/api/agriturismi";

export const createAgriturismo = async (data) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create agriturismo");
  }
  return response.json();
};
