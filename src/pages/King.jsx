import React, { useState, useEffect } from "react";
import axios from "axios";
import BarangayDropdown from "../components/BarangayDropdown";
import KingSearchBox from "../components/KingSearchBox";
import KingNumber from "../components/KingNumber";

export default function King() {
  // State for storing barangays and people data
  const [barangays, setBarangays] = useState([]);
  const [people, setPeople] = useState([]);

  // State for managing selected barangay, king, and search
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [king, setKing] = useState(null);
  const [kingName, setKingName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // UI states
  const [isKingAdded, setIsKingAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showKingNumber, setShowKingNumber] = useState(true);

  // Fetch barangays and people data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barangaysRes, peopleRes] = await Promise.all([
          axios.get("http://localhost:3001/barangay"),
          axios.get("http://localhost:3001/people"),
        ]);
        setBarangays(barangaysRes.data);
        setPeople(peopleRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Filter people based on selected barangay
  useEffect(() => {
    const filtered = selectedBarangay
      ? people.filter((person) => person.barangay === selectedBarangay)
      : [];
    setFilteredPeople(filtered);
  }, [selectedBarangay, people]);

  // Handle barangay selection and reset relevant state
  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setIsKingAdded(false);
    setShowKingNumber(true);
    setIsOpen(false);

    const selected = barangays.find((b) => b.barangay_name === barangay);
    if (selected) {
      setKing(selected.king || null);
      setKingName(selected.king_name || "");
      setSelectedPerson(selected.king || "");
    } else {
      setKing(null);
      setKingName("");
      setSelectedPerson("");
    }

    setSearchText("");
  };

  // Add king to the selected barangay
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

        // Refresh barangays data to reflect changes
        const { data } = await axios.get("http://localhost:3001/barangay");
        setBarangays(data);

        setSelectedPerson(king);
        setShowKingNumber(true);
        resetForm();
      } catch (err) {
        console.error("Error adding king:", err);
        alert("An error occurred while adding the king.");
      }
    }
  };

  // Reset form state
  const resetForm = () => {
    setKing(null);
    setFilteredPeople([]);
    setIsKingAdded(false);
  };

  // Update suggestions based on search input
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    if (!value) {
      setSuggestions([]);
      setKingName("");
      return;
    }

    const tokens = value.split(" ");
    const filteredSuggestions = filteredPeople
      .map((person) => ({
        person,
        score: tokens.reduce(
          (acc, token) =>
            acc + (person.name.toLowerCase().includes(token) ? 1 : 0),
          0
        ),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ person }) => person);

    setSuggestions(filteredSuggestions);
  };

  // Select a person from suggestions
  const handlePersonSelect = (person) => {
    setSelectedPerson(person._id);
    setKing(person._id);
    setKingName(person.name);
    setSearchText(person.name);
    setSuggestions([]);
    setShowKingNumber(true);
  };

  // Check if the selected barangay already has a king number
  const barangayWithKing = barangays.find(
    (b) => b.barangay_name === selectedBarangay
  );
  const kingHasNumber =
    barangayWithKing &&
    barangayWithKing.king &&
    people.find((p) => p._id === barangayWithKing.king)?.number;

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
        {!kingHasNumber && showKingNumber && (
          <KingNumber
            personId={selectedPerson}
            onSuccess={() => {
              setShowKingNumber(false);
              setIsKingAdded(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
