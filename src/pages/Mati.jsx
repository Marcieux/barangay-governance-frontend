import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import BarangaySearchBox from "../components/BarangaySearchBox";
import BarangayContext from "../contexts/BarangayContext";

export default function Mati() {
  const { barangays } = useContext(BarangayContext);
  const [searchParams] = useSearchParams();
  const selectedBarangayName = searchParams.get("barangay");
  const [showStructure, setShowStructure] = useState(false);
  const [generalCount, setGeneralCount] = useState(0);
  const [isBarangaySelected, setIsBarangaySelected] = useState(false); // Tracks if a barangay is selected
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
        }
      };

      fetchGeneralCount();
    }
  }, [selectedBarangayName]);

  // Function to handle click on KA (Princes)
  const handleKAClick = () => {
    if (selectedBarangayName) {
      navigate(`/get-names/mati/${selectedBarangayName}/ipmr`);
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

  return (
    <div className="flex flex-row items-center gap-10 justify-between">
      {selectedBarangayName && (
        <div className="text-center bg-white p-6 rounded shadow-md w-[700px] space-y-7">
          <h1 className="text-2xl font-bold text-gray-800 mt-5">MATI</h1>
          <p className="text-xl font-medium text-gray-600 uppercase">
            Barangay: {selectedBarangayName}
          </p>

          <div className="flex justify-between mx-10 text-sm">
            <button
              className="text-red-500 font-medium rounded-md p-2 hover:underline"
              onClick={() => setShowStructure(true)}
            >
              Structure
            </button>
            <button className="text-red-500 font-medium rounded-md p-2 hover:underline">
              Functionaries
            </button>
          </div>

          {showStructure && (
            <div className="mt-4 space-y-8 text-left">
              <p className="text-sm space-x-8 border-b border-red-300">
                <span className="font-bold">AC: </span>
                <span className="text-red-600 font-medium">
                  {kingName || "No king assigned"}{" "}
                </span>
              </p>
              <p className="text-sm space-x-8 border-b border-red-300">
                <span
                  className="font-bold cursor-pointer"
                  onClick={handleKAClick}
                >
                  KA:{" "}
                </span>
                <span className="text-red-600 font-medium">{princeCount}</span>
              </p>
              <p className="text-sm space-x-5 border-b border-red-300">
                <span
                  className="font-bold cursor-pointer"
                  onClick={handleWTCClick}
                >
                  WTC:{" "}
                </span>
                <span className="text-red-600 font-medium">{generalCount}</span>
              </p>
              <p className="text-sm space-x-10 border-b border-red-300">
                <span className="font-bold cursor-pointer">FL:</span>
                <span className="text-red-600"> </span>
              </p>
            </div>
          )}
        </div>
      )}

      <div
        className={`bg-white p-6 rounded shadow-md w-[400px] space-y-4 ${
          isBarangaySelected ? "absolute top-14 right-14" : "relative"
        }`}
      >
        <BarangaySearchBox />
      </div>
    </div>
  );
}
