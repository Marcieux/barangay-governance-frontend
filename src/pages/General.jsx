import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";
import Prince from "./Prince";
import GeneralSearchBox from "../components/GeneralSearchBox";
import GeneralNumber from "../components/GeneralNumber";

export default function General() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [generalId, setGeneralId] = useState(null);
  const [generalName, setGeneralName] = useState("");
  const [generalSearchText, setGeneralSearchText] = useState("");
  const [generalSuggestions, setGeneralSuggestions] = useState([]);
  const [isGeneralAdded, setIsGeneralAdded] = useState(false);
  const [showGeneralNumber, setShowGeneralNumber] = useState(false);
  const [kingId, setKingId] = useState(null);
  const [kingName, setKingName] = useState("");

  // Track prince data
  const [princeId, setPrinceId] = useState(null);
  const [princeName, setPrinceName] = useState("");

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
      setKingName(selectedBarangayData.king_name);
    }
  }, [selectedBarangay, barangays]);

  const handleGeneralSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setGeneralSearchText(value);

    if (!value) {
      setGeneralSuggestions([]);
      setGeneralId(null);
      setGeneralName("");
      return;
    }

    const tokens = value.split(" ");

    const filteredSuggestions = filteredPeople
      .filter((person) => person._id !== kingId)
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

    setGeneralSuggestions(filteredSuggestions);
  };

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setIsGeneralAdded(false);
    setGeneralId(null);
    setGeneralName("");
    setGeneralSearchText("");
    setShowGeneralNumber(false);
  };

  const handleAddGeneral = async () => {
    if (!kingId) {
      alert("Set King first.");
      return;
    }

    if (!princeId) {
      alert("Select a prince first.");
      return;
    }

    try {
      const { data: personData } = await axios.get(
        `http://localhost:3001/people/${generalId}`
      );

      // Check if the selected person is already a prince
      if (personData.role === "prince") {
        alert(
          `This person '${generalName}' is already a prince and cannot be added as a general.`
        );
        return;
      }

      // Check if the selected person is already a general
      if (personData.role === "general") {
        alert(
          `'${generalName}' is already a general and cannot be added again.`
        );
        return;
      }

      if (
        window.confirm(
          `Are you sure you want to set '${generalName}' as general of '${selectedBarangay.barangay_name}'?`
        )
      ) {
        await axios.put(`http://localhost:3001/people/${generalId}`, {
          role: "general",
          barangay_id: selectedBarangay._id,
        });

        await axios.post("http://localhost:3001/general", {
          general_id: generalId,
          general_name: generalName,
          barangay_name: selectedBarangay.barangay_name,
          barangay_id: selectedBarangay._id,
          king_id: kingId,
          king_name: kingName,
          prince_id: princeId,
          prince_name: princeName,
        });

        alert("General has been added successfully!");
        setShowGeneralNumber(true);
        setIsGeneralAdded(true);
      }
    } catch (err) {
      console.error("Error adding general:", err);
      alert("An error occurred while adding the general.");
    }
  };

  const handleGeneralSelect = (person) => {
    setGeneralId(person._id);
    setGeneralName(person.name);
    setGeneralSearchText(person.name);
    setGeneralSuggestions([]);
    setShowGeneralNumber(false);
  };

  const handleSelectPrince = (id, name) => {
    setPrinceId(id); // Set selected prince ID
    setPrinceName(name); // Set selected prince name
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Prince
        handleBarangayChange={handleBarangayChange}
        onSelectPrince={handleSelectPrince}
      />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <GeneralSearchBox
          searchText={generalSearchText}
          handleSearchChange={handleGeneralSearchChange}
          suggestions={generalSuggestions}
          handlePersonSelect={handleGeneralSelect}
          handleAddGeneral={handleAddGeneral}
        />
        {isGeneralAdded && showGeneralNumber && (
          <GeneralNumber
            personId={generalId}
            onSuccess={() => {
              setShowGeneralNumber(false);
              setGeneralSearchText("");
            }}
          />
        )}
      </div>
    </div>
  );
}
