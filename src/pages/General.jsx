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
  const [princeDetails, setPrinceDetails] = useState("");

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
      setKingName(selectedBarangayData.king_name);
    }
  }, [selectedBarangay, barangays, generalId]);

  const handleGeneralSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setGeneralSearchText(value);

    if (!value) {
      setGeneralSuggestions([]);
      setGeneralName("");
      return;
    }

    const tokens = value.split(" ");

    const filteredSuggestions = filteredPeople
      .filter(
        (person) =>
          person._id !== kingId &&
          person.role !== "prince" &&
          person.role !== "general"
      )
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

    if (
      window.confirm(
        `Are you sure you want to set '${generalName}' as general of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        // Fetch prince details for all princes from the selected barangay
        const princeIds = selectedBarangay.prince; // All prince IDs in the barangay

        if (princeIds.length === 0) {
          alert("No prince found for this barangay.");
          return;
        }

        // Fetch details for all princes
        const princeDetailsPromises = princeIds.map(
          (princeId) => axios.get(`http://localhost:3001/prince/${princeId}`) // Fetch each prince's details
        );

        const princeResponses = await Promise.all(princeDetailsPromises);
        const princeDataArray = princeResponses.map(
          (response) => response.data
        );

        // Ensure all prince data is valid
        const validPrinceData = princeDataArray.filter(
          (princeData) => princeData
        );

        if (validPrinceData.length === 0) {
          alert("No prince details found.");
          return;
        }

        // Collect prince IDs and names
        const princeIdsArray = validPrinceData.map(
          (prince) => prince.prince_id
        );
        const princeNamesArray = validPrinceData.map(
          (prince) => prince.prince_name
        );

        setPrinceDetails({
          princeIds: princeIdsArray, // Array of prince IDs
          princeNames: princeNamesArray, // Array of prince names
        });

        // Now proceed with adding the general to the database
        await axios.put(`http://localhost:3001/people/${generalId}`, {
          role: "general",
          barangay_id: selectedBarangay._id,
        });

        const response = await axios.post("http://localhost:3001/general", {
          general_id: generalId,
          general_name: generalName,
          barangay_name: selectedBarangay.barangay_name,
          barangay_id: selectedBarangay._id,
          king_id: kingId,
          king_name: kingName,
          prince_id: princeIdsArray, 
          prince_name: princeNamesArray, 
        });

        const newGeneralId = response.data._id;
        await Promise.all(
          selectedBarangay.prince.map((princeId) =>
            axios.put(`http://localhost:3001/prince/${princeId}/general`, {
              general: [newGeneralId],
            })
          )
        );

        alert("General has been added successfully!");
        setShowGeneralNumber(true);
        setIsGeneralAdded(true);
      } catch (err) {
        console.error("Error adding general:", err);
        alert("An error occurred while adding the general.");
      }
    }
  };

  const handleGeneralSelect = (person) => {
    setGeneralId(person._id);
    setGeneralName(person.name);
    setGeneralSearchText(person.name);
    setGeneralSuggestions([]);
    setShowGeneralNumber(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Prince handleBarangayChange={handleBarangayChange} />
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
