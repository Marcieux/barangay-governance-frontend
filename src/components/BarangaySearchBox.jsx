import React, { useState, useContext } from "react";
import BarangayContext from "../contexts/BarangayContext";
import { useNavigate } from "react-router-dom";

export default function BarangaySearchBox() {
  const { barangays, setSelectedBarangay } = useContext(BarangayContext);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();

  const handleBarangaySelect = (barangay) => {
    setSelectedBarangay(barangay._id);
    setSearchText(barangay.barangay_name);
    setSearchText("");

    navigate(`/get-names/mati?barangay=${barangay.barangay_name}`);
  };

  // Simulate a fetch with a timeout for demonstration
  const filteredBarangays = barangays
    .filter((barangay) => barangay.municipality === "Mati") // Filter by municipality
    .filter((barangay) =>
      barangay.barangay_name
        .toLowerCase()
        .split(" ")
        .some((word) => word.startsWith(searchText.toLowerCase()))
    );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value) {
      setLoading(true); // Start loading
      setTimeout(() => {
        setLoading(false); // Simulate fetch completion
      }, 10000); // Adjust the timeout duration as needed
    } else {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        className="w-full p-2 border border-red-500 rounded text-sm outline-none"
        placeholder="Search Barangay..."
        value={searchText}
        onChange={handleSearchChange}
      />
      {searchText && (
        <div className="absolute z-10 w-[350px] bg-white border border-red-500 rounded mt-1 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-sm text-gray-500">Loading...</div>
          ) : filteredBarangays.length > 0 ? (
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
