import React, { useState } from "react";

export default function BarangayDropdown({ barangays, onBarangayChange, disabled, isOpen, setIsOpen }) {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false); 
  const [filteredBarangays, setFilteredBarangays] = useState([]); 

  // Filter barangays based on search text
  const fetchFilteredBarangays = async (query) => {
    setLoading(true);
    try {
      const results = barangays.filter((barangay) =>
        barangay.barangay_name
          .toLowerCase()
          .split(" ")
          .some((word) => word.startsWith(query.toLowerCase())) // Filter based on the start of each word
      );
      
      // Simulate delay for loading effect
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFilteredBarangays(results);
    } catch (error) {
      console.error("Error fetching barangays:", error);
      setFilteredBarangays([]);
    } finally {
      setLoading(false);
    }
  };


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value) {
      setIsOpen(true);
      fetchFilteredBarangays(value);
    } else {
      setFilteredBarangays([]); 
      setIsOpen(false); 
    }
  };


  const handleBarangaySelect = (barangay) => {
    onBarangayChange(barangay);
    setSearchText(barangay.barangay_name); 
    setFilteredBarangays([]); 
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full p-2 border border-red-500 rounded text-sm outline-none"
        placeholder="Search Barangay..."
        value={searchText}
        onChange={handleSearchChange}
        disabled={disabled}
      />
      
      {isOpen && searchText && (
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
