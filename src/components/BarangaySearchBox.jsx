import React, { useState, useContext } from "react";
import BarangayContext from "../contexts/BarangayContext";
import { useNavigate } from "react-router-dom";

export default function BarangaySearchBox() {
  const { barangays, setSelectedBarangay } = useContext(BarangayContext);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const filteredBarangays = barangays
    .filter((barangay) => barangay.municipality === "Mati") // Filter by municipality
    .filter((barangay) =>
      barangay.barangay_name
        .toLowerCase()
        .split(" ")
        .some((word) => word.startsWith(searchText.toLowerCase()))
    );

  const handleBarangaySelect = (barangay) => {
    setSelectedBarangay(barangay._id);
    setSearchText(barangay.barangay_name);
    setSearchText("");
    
    navigate(`/get-names/mati?barangay=${barangay.barangay_name}`);
  };

  return (
    <div>
      {/* <label className="block mb-2 text-sm font-medium text-red-500">
        Barangay
      </label> */}
      <input
        type="text"
        className="w-full p-2 border border-red-500 rounded text-sm outline-none"
        placeholder="Search Barangay..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      {searchText && (
        <div className="absolute z-10 w-[350px] bg-white border border-red-500 rounded mt-1 max-h-60 overflow-y-auto">
          {filteredBarangays.length > 0 ? (
            filteredBarangays.map((barangay) => (
              <div
                key={barangay._id}
                onClick={() => handleBarangaySelect(barangay)}
                className="p-2 cursor-pointer text-sm hover:bg-gray-100"
              >
                {barangay.barangay_name}
              </div>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500">No Barangays Found</div>
          )}
        </div>
      )}
    </div>
  );
}
