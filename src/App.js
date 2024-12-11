import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BarangayProvider } from "./contexts/BarangayContext";
import axios from "axios";
import Login from "./pages/Login";
import King from "./pages/King";
import Prince from "./pages/Prince";
import General from "./pages/General";
import Cafgu from "./pages/Cafgu";
import PurokChair from "./pages/PurokChair";
import TagaPamayapa from "./pages/TagaPamayapa";
import Bhw from "./pages/Bhw";
import Tanod from "./pages/Tanod";
import PublicSafety from "./pages/PublicSafety";
import BantayDagat from "./pages/BantayDagat";
import Coastal from "./pages/Coastal";
import Mati from "./pages/Mati";
import Ablc from "./pages/Ablc";
import Apc from "./pages/Apc";
import NotFound from "./pages/NotFound";

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
            <Route path="/encode-name/king" element={<King />} />
            <Route path="/encode-name/set-prince" element={<Prince />} />
            <Route path="/encode-name/set-general" element={<General />} />
            <Route path="/encode-name/set-cafgu" element={<Cafgu />} />
            <Route path="/encode-name/set-purok-chair" element={<PurokChair />} />
            <Route path="/encode-name/set-tagapamayapa" element={<TagaPamayapa />} />
            <Route path="/encode-name/bhw" element={<Bhw />} />
            <Route path="/encode-name/tanod" element={<Tanod />} />
            <Route path="/encode-name/public-safety" element={<PublicSafety />} />
            <Route path="/encode-name/bantay-dagat" element={<BantayDagat />} />
            <Route path="/encode-name/coastal" element={<Coastal />} />
            <Route path="/get-names/" element={<Mati />} />
            <Route path="/get-names/:barangay/ablc" element={<Ablc />} />
            <Route path="/get-names/:barangay/ablc/:id" element={<Apc />} />
            <Route path="*" element={<NotFound />}/>
          </Routes>
        </BrowserRouter>
      </main>
    </BarangayProvider>
  );
}

export default App;
