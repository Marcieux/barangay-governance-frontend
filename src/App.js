import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BarangayProvider } from "./contexts/BarangayContext";
import axios from "axios";
import Login from "./pages/Login";
import AngatChair from "./pages/encode-names/AngatChair";
import Bco from "./pages/encode-names/Bco";
import Pcs from "./pages/encode-names/Pcs";
import Cafgu from "./pages/encode-names/Cafgu";
import PurokChair from "./pages/encode-names/PurokChair";
import TagaPamayapa from "./pages/encode-names/TagaPamayapa";
import Bhw from "./pages/encode-names/Bhw";
import Tanod from "./pages/encode-names/Tanod";
import PublicSafety from "./pages/encode-names/PublicSafety";
import BantayDagat from "./pages/encode-names/BantayDagat";
import Coastal from "./pages/encode-names/Coastal";
import GetNames from "./pages/get-names/GetNames";
import BcoList from "./pages/get-names/BcoList";
import BcoPcsList from "./pages/get-names/BcoPcsList";
import PcsList from "./pages/get-names/PcsList";
import FamilyHead from "./pages/encode-names/FamilyHead";
import ReferralPage from "./pages/encode-names/ReferralPage";
import NotFound from "./modals/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PclList from "./pages/get-names/PclList";
import PcsPclList from "./pages/get-names/PcsPclList";
import SearchPerson from "./pages/search-person/SearchPerson";
import MunicipalCounter from "./pages/counter/MunicipalCounter";
import BarangayCounter from "./pages/counter/BarangayCounter";
import Navigation from "./components/Navigation";
import FamilyGroup from "./pages/encode-names/FamilyGroup";
import FmList from "./pages/get-names/FmList";
import PclFmList from "./pages/get-names/PclFmList";

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
                <Route path="/encode-name/angat-chair" element={<AngatChair />} />
                <Route path="/encode-name/set-bco" element={<Bco />} />
                <Route path="/encode-name/set-pcs" element={<Pcs />} />
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
              </Route>

              {/* Admin/Superadmin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["superadmin", "admin"]} />}>
                <Route path="/get-names" element={<GetNames />} />
                <Route path="/get-names/:barangay/bco" element={<BcoList />} />
                <Route path="/get-names/:barangay/bco/:id" element={<BcoPcsList />} />
                <Route path="/get-names/:barangay/pcs/" element={<PcsList />} />
                <Route path="/get-names/:barangay/pcs/:id" element={<PcsPclList />} />
                <Route path="/get-names/:barangay/pcl/" element={<PclList />} />
                <Route path="/get-names/:barangay/pcl/:id" element={<PclFmList />} />
                <Route path="/get-names/:barangay/fm/" element={<FmList />} />
                <Route path="/search" element={<SearchPerson />} />
                <Route path="/counter" element={<MunicipalCounter />} />
                <Route path="/counter/:municipality" element={<BarangayCounter />} />
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
