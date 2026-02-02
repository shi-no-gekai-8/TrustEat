import "./App.css";
import HomePage from "./pages/HomePage";
import AgriturismoSignup from "./pages/AgriturismoSignup";
import Dashboard from "./pages/Dashboard";
import AgriturismoLogin from "./pages/AgriturismoLogin";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup/agriturismo" element={<AgriturismoSignup />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/login" element={<AgriturismoLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
