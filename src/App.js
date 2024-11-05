import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BarangayProvider } from "./contexts/BarangayContext";
import axios from "axios";
import Login from "./pages/Login";
import King from "./pages/King";

function App() {
  useEffect(() => {
    axios
      .get("http://localhost:3001/")
      .then((res) => {
        console.log(res.data); // Should log: "Backend is connected!"
      })
      .catch((err) => console.error("Error connecting to backend:", err));
  }, []);

  return (
    <BarangayProvider>
      <main className="min-h-screen flex items-center justify-center bg-red-500">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/encodename/king" element={<King />} />
          </Routes>
        </BrowserRouter>
      </main>
    </BarangayProvider>
  );
}

export default App;
