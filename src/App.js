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
import AblcApc from "./pages/AblcApc";
import Apc from "./pages/Apc";
import FamilyHead from "./pages/FamilyHead";
import ReferralPage from "./pages/ReferralPage";
import NotFound from "./modals/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Fl from "./pages/Fl";
import ApcFl from "./pages/ApcFl";
import SearchPerson from "./pages/SearchPerson";
import MunicipalCounter from "./pages/MunicipalCounter";
import BarangayCounter from "./pages/BarangayCounter";
import Navigation from "./components/Navigation";
import FamilyGroup from "./pages/FamilyGroup";

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
      <BrowserRouter>
        <div className="min-h-screen flex items-center justify-center bg-red-500">
          <Navigation />
          <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8"> {/* Added padding for nav */}
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Encoder Routes */}
              <Route element={<ProtectedRoute allowedRoles={["encoder", "superadmin", "admin"]} />}>
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
                <Route path="/encode-name/set-fh" element={<FamilyHead />} />
                <Route path="/encode-name/set-referral-page" element={<ReferralPage />} />
                <Route path="/encode-name/set-fg" element={<FamilyGroup />} />
                <Route path="/search" element={<SearchPerson />} />
                <Route path="/counter" element={<MunicipalCounter />} />
                <Route path="/counter/:municipality" element={<BarangayCounter />} />
              </Route>

              {/* Admin/Superadmin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["superadmin", "admin"]} />}>
                <Route path="/get-names" element={<Mati />} />
                <Route path="/get-names/:barangay/ablc" element={<Ablc />} />
                <Route path="/get-names/:barangay/ablc/:id" element={<AblcApc />} />
                <Route path="/get-names/:barangay/apc/" element={<Apc />} />
                <Route path="/get-names/:barangay/apc/:id" element={<ApcFl />} />
                <Route path="/get-names/:barangay/fl/" element={<Fl />} />
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </BarangayProvider>
  );
}

export default App;
