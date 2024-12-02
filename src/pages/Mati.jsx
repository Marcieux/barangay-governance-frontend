import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import BarangaySearchBox from "../components/BarangaySearchBox";
import BarangayContext from "../contexts/BarangayContext";
import Loading from "../components/Loading"; // Adjust the path to match your file structure

export default function Mati() {
  const { barangays } = useContext(BarangayContext);
  const [searchParams] = useSearchParams();
  const selectedBarangayName = searchParams.get("barangay");
  const [showStructure, setShowStructure] = useState(false);
  const [generalCount, setGeneralCount] = useState(0);
  const [isBarangaySelected, setIsBarangaySelected] = useState(false); // Tracks if a barangay is selected
  const [loading, setLoading] = useState(false); // Loading state for fetch calls
  const navigate = useNavigate();

  // Fetch the barangay data based on the selected barangay
  const selectedBarangayData = barangays.find(
    (barangay) => barangay.barangay_name === selectedBarangayName
  );
  const kingName = selectedBarangayData ? selectedBarangayData.king_name : "";

  // Count the total number of princes in the barangay
  const princeCount = selectedBarangayData
    ? selectedBarangayData.prince
      ? selectedBarangayData.prince.length
      : 0
    : 0;

  // Fetch the generals from the API
  useEffect(() => {
    if (selectedBarangayName) {
      const fetchGeneralCount = async () => {
        setLoading(true); // Start loading
        try {
          const response = await axios.get(
            "http://localhost:3001/people/generals",
            {
              params: { barangay: selectedBarangayName },
            }
          );
          setGeneralCount(response.data.count || 0);
        } catch (error) {
          console.error("Error fetching generals count:", error);
          setGeneralCount(0);
        } finally {
          setLoading(false); // Stop loading
        }
      };

      fetchGeneralCount();
    }
  }, [selectedBarangayName]);

  // Function to handle click on KA (Princes)
  const handleKAClick = async () => {
    if (selectedBarangayName) {
      setLoading(true); // Start loading
      try {
        const response = await axios.get("http://localhost:3001/people/");
        const people = response.data;

        // Filter the princes based on barangay name and role
        const princes = people
          .filter(
            (person) =>
              person.barangay_name?.toLowerCase() ===
                selectedBarangayName.toLowerCase() &&
              person.role === "prince"
          )
          .map((prince) => ({
            name: prince.name,
            number: prince.number,
            precinct: prince.precinct,
          }));

        // Navigate to AngatKa page with the relevant data
        navigate(`/get-names/mati/${selectedBarangayName}/angat-ka`, {
          state: {
            barangayName: selectedBarangayName,
            kingName: kingName,
            princes: princes,
          },
        });
      } catch (error) {
        console.error("Failed to fetch or process princes:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      console.warn("No barangay name selected.");
    }
  };

  // Function to handle click on WTC (Generals)
  const handleWTCClick = () => {
    if (selectedBarangayName) {
      navigate(`/get-names/mati/${selectedBarangayName}/wtc`);
    }
  };

  // Update the state when a barangay is selected
  useEffect(() => {
    if (selectedBarangayName) {
      setIsBarangaySelected(true);
    }
  }, [selectedBarangayName]);

  // Show loading spinner if fetching data
  if (loading) {
    return <Loading message="Please wait..." />;
  }

  return (
    <div className="flex flex-row items-center justify-between">
      {selectedBarangayName && (
        <div className="text-center bg-white p-6 rounded shadow-md w-[700px] space-y-5">
          <h1 className="text-3xl font-bold text-gray-800">MATI</h1>
          <p className="text-xl font-bold text-gray-600 uppercase">
            Barangay: {selectedBarangayName}
          </p>

          <div className="flex justify-between mx-10 text-sm">
            <button
              className="bg-red-500 text-white font-medium rounded-md p-2"
              onClick={() => setShowStructure(true)}
            >
              Structure
            </button>
            <button className="bg-red-500 text-white font-medium rounded-md p-2">
              Functionaries
            </button>
          </div>

          {showStructure && (
            <div className="mt-4 space-y-8 text-left">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="border p-2 font-bold">AC:</td>
                    <td className="border p-2">{kingName || "No king assigned"}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td
                      className="border p-2 font-bold cursor-pointer"
                      onClick={handleKAClick}
                    >
                      KA:
                    </td>
                    <td className="border p-2">{princeCount}</td>
                  </tr>
                  <tr>
                    <td
                      className="border p-2 font-bold cursor-pointer"
                      onClick={handleWTCClick}
                    >
                      WTC:
                    </td>
                    <td className="border p-2">{generalCount}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-2 font-bold">FL:</td>
                    <td className="border p-2 font-bold">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div
        className={`bg-white p-6 rounded shadow-md w-[400px] space-y-4 ${
          isBarangaySelected ? "absolute top-20 right-20" : "relative"
        }`}
      >
        <BarangaySearchBox />
      </div>
    </div>
  );
}
