import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error(err));
  }, []);
  return (
    <div style={{ padding: "2rem" }}>
      <h1>🥗 TrustEat</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
