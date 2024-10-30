import React, { useState, useEffect } from "react";
import axios from "axios";
import BarangayDropdown from "../components/BarangayDropdown";
import KingSearchBox from "../components/KingSearchBox";

export default function King() {
  const [barangays, setBarangays] = useState([]); // List of barangays
  const [people, setPeople] = useState([]); // List of people
  const [selectedBarangay, setSelectedBarangay] = useState(""); // Selected barangay name
  const [filteredPeople, setFilteredPeople] = useState([]); // People belonging to the selected barangay
  const [selectedPerson, setSelectedPerson] = useState(""); // Selected person ID for king
  const [king, setKing] = useState(null); // ID of selected person as king
  const [kingName, setKingName] = useState(""); // Name of the selected king
  const [searchText, setSearchText] = useState(""); // Text for search input
  const [suggestions, setSuggestions] = useState([]); // Suggestion list based on input
  const [isKingAdded, setIsKingAdded] = useState(false); // Track if king is added
  const [isOpen, setIsOpen] = useState(false); // Control dropdown visibility

  // Fetch barangays and people from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barangaysResponse, peopleResponse] = await Promise.all([
          axios.get("http://localhost:3001/barangay"),
          axios.get("http://localhost:3001/people"),
        ]);
        setBarangays(barangaysResponse.data);
        setPeople(peopleResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Update filtered people when a barangay is selected
  useEffect(() => {
    const filtered = selectedBarangay
      ? people.filter((person) => person.barangay === selectedBarangay)
      : [];
    setFilteredPeople(filtered);
  }, [selectedBarangay, people]);

  // Handle barangay selection changes
  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setSelectedPerson("");
    setKing(null);
    setIsKingAdded(false);

    const selected = barangays.find((b) => b.barangay_name === barangay);
    setKingName(selected?.king_name || "");
    setSearchText("");
    setIsOpen(false); // Close the dropdown
  };

  // Confirm and add the selected person as king
  const handleAddKing = async () => {
    if (
      window.confirm(
        `Are you sure you want to set '${kingName}' as king of '${selectedBarangay}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/barangay/${selectedBarangay}`, {
          king,
          king_name: kingName,
        });
        alert("King has been added successfully!");
        setIsKingAdded(true);
        resetForm();
      } catch (err) {
        console.error("Error adding king:", err);
        alert("An error occurred while adding the king.");
      }
    }
  };

  // Reset form fields after adding a king
  const resetForm = () => {
    setKing(null);
    setSelectedPerson("");
    setFilteredPeople([]);
  };

  // Handle changes in search input
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    if (!value) {
      setSuggestions([]);
      setKingName("");
      return;
    }

    const tokens = value.split(" "); // Split input into individual tokens (words) for multi-word matching

    // Generate filtered suggestions based on relevance scores
    const filteredSuggestions = filteredPeople
      .map((person) => ({
        person, // Original person data
        // Calculate relevance score by checking how many tokens are in the name
        score: tokens.reduce(
          (acc, token) =>
            acc + (person.name.toLowerCase().includes(token) ? 1 : 0),
          0
        ),
      }))
      .filter(({ score }) => score > 0) // Filter out results with no matches
      .sort((a, b) => b.score - a.score) // Sort by relevance score, highest first
      .map(({ person }) => person); // Extract the person objects after sorting

    setSuggestions(filteredSuggestions);
  };

  // Handle selection of a person from suggestions
  const handlePersonSelect = (person) => {
    setSelectedPerson(person._id);
    setKing(person._id);
    setKingName(person.name);
    setSearchText(person.name);
    setSuggestions([]);
  };

  // Find if the selected barangay already has a king
  const barangayWithKing = barangays.find(
    (b) => b.barangay_name === selectedBarangay
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-500">
      <div className="bg-white p-6 rounded shadow-md w-[400px] space-y-4">
        <BarangayDropdown
          barangays={barangays}
          selectedBarangay={selectedBarangay}
          onBarangayChange={handleBarangayChange}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
        <KingSearchBox
          barangayWithKing={barangayWithKing}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          suggestions={suggestions}
          handlePersonSelect={handlePersonSelect}
          king={king}
          handleAddKing={handleAddKing}
          isKingAdded={isKingAdded}
          kingName={kingName}
        />
      </div>
    </div>
  );
}
