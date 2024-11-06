import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import BarangayDropdown from "../components/BarangayDropdown";
import KingSearchBox from "../components/KingSearchBox";
import KingNumber from "../components/KingNumber";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";

export default function King() {
  const { barangays, selectedBarangay, setSelectedBarangay, setBarangays } =
    useContext(BarangayContext);

  const filteredPeople = useFilteredPeople();
  const [selectedPerson, setSelectedPerson] = useState("");
  const [king, setKing] = useState(null);
  const [kingName, setKingName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [isKingAdded, setIsKingAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showKingNumber, setShowKingNumber] = useState(false);
  const [isKingNumberAssigned, setIsKingNumberAssigned] = useState(false);
  const [canSwitchBarangay, setCanSwitchBarangay] = useState(true);

  useEffect(() => {
    if (king && !isKingNumberAssigned) {
      setCanSwitchBarangay(false);
    } else {
      setCanSwitchBarangay(true);
    }
  }, [king, isKingNumberAssigned]);

  const handleBarangayChange = (barangay) => {
    if (!canSwitchBarangay) {
      alert(
        "Please assign a number to the added king before switching barangays."
      );
      return;
    }
    setSelectedBarangay(barangay);
    resetForm();
  };

  const handleAddKing = async () => {
    if (
      window.confirm(
        `Are you sure you want to set '${kingName}' as king of '${selectedBarangay}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${king}`, {
          role: "king",
        });

        await axios.put(`http://localhost:3001/barangay/${selectedBarangay}`, {
          king_id: king,
          king_name: kingName,
        });
        alert("King has been added successfully!");

        const { data } = await axios.get("http://localhost:3001/barangay");
        setBarangays(data);

        setSelectedPerson(king);
        setIsKingAdded(true);
        setShowKingNumber(true);
        setIsKingNumberAssigned(false);
      } catch (err) {
        console.error("Error adding king:", err);
        alert("An error occurred while adding the king.");
      }
    }
  };

  const resetForm = () => {
    setKing(null);
    setIsKingAdded(false);
    setIsKingNumberAssigned(false);
    setShowKingNumber(false);
    setCanSwitchBarangay(true);
    setSearchText("");
  };

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

  const handlePersonSelect = (person) => {
    setSelectedPerson(person._id);
    setKing(person._id);
    setKingName(person.name);
    setSearchText(person.name);
    setSuggestions([]);
    setShowKingNumber(false);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-[400px] space-y-4">
        <BarangayDropdown
          barangays={barangays}
          selectedBarangay={selectedBarangay}
          onBarangayChange={handleBarangayChange}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          disabled={!canSwitchBarangay}
        />
        <KingSearchBox
          barangayWithKing={barangays.find(
            (b) => b.barangay_name === selectedBarangay
          )}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          suggestions={suggestions}
          handlePersonSelect={handlePersonSelect}
          king={king}
          handleAddKing={handleAddKing}
          isKingAdded={isKingAdded}
          kingName={kingName}
        />
        {!isKingNumberAssigned && showKingNumber && (
          <KingNumber
            personId={selectedPerson}
            onSuccess={() => {
              setShowKingNumber(false);
              setIsKingAdded(true);
              setIsKingNumberAssigned(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
