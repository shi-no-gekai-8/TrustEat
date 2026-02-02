import "./App.css";
import HomePage from "./pages/HomePage";
import AgriturismoSignup from "./pages/AgriturismoSignup";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup/agriturismo" element={<AgriturismoSignup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
