import React, { useState, useEffect } from "react";

export default function PurokSearchBox({
  purokList,
  setSelectedPurok
}) {
  const [searchPurok, setSearchPurok] = useState("");
  const [filteredPurokList, setFilteredPurokList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Filter purokList based on search text
  useEffect(() => {
    if (purokList.length > 0) {
      setFilteredPurokList(purokList);
    }
  }, [purokList]);

  const fetchFilteredPurokList = async (query) => {
    setLoading(true);
    try {
      const results = purokList.filter(
        (purok) => purok.toLowerCase().startsWith(query.toLowerCase()) // Filter based on the start of each word
      );

      // Simulate delay for loading effect
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFilteredPurokList(results);
    } catch (error) {
      console.error("Error fetching puroks:", error);
      setFilteredPurokList([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurokSearch = (e) => {
    const value = e.target.value;
    setSearchPurok(value);
    if (value) {
      setIsOpen(true);
      fetchFilteredPurokList(value);
    } else {
      setFilteredPurokList(purokList); // Reset to the full list when the search is cleared
      setIsOpen(false);
    }
  };

  const handlePurokSelect = (purok) => {
    setSelectedPurok(purok); // Update the selected purok
    setSearchPurok(purok); // Update the search field with the selected value
    setFilteredPurokList([]); // Clear the filtered list
    setIsOpen(false); // Close the dropdown
  };

  return (
    <div>
      <div className="flex justify-between">
        <input
          type="text"
          value={searchPurok}
          onChange={handlePurokSearch}
          placeholder="Search Purok..."
          className="w-full p-2 border border-red-500 rounded text-sm outline-none"
        />
      </div>

      {isOpen && searchPurok && (
        <div className="absolute z-10 w-[350px] bg-white border border-red-500 rounded mt-1 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-sm text-gray-500">Loading...</div>
          ) : filteredPurokList.length > 0 ? (
            filteredPurokList.map((purok, index) => (
              <div
                key={index}
                onClick={() => handlePurokSelect(purok)}
                className="p-2 cursor-pointer text-sm hover:bg-gray-100"
              >
                {purok}
              </div>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500">No Puroks Found</div>
          )}
        </div>
      )}
    </div>
  );
}
