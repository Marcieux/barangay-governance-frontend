import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import King from "./King";
import PrinceSearchBox from "../components/PrinceSearchBox";
import PrinceNumber from "../components/PrinceNumber";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";

export default function Prince({ onSelectPrince = () => {} }) {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [princeId, setPrinceId] = useState(null);
  const [princeName, setPrinceName] = useState("");
  const [princeSearchText, setPrinceSearchText] = useState("");
  const [princeSuggestions, setPrinceSuggestions] = useState([]);
  const [isPrinceAdded, setIsPrinceAdded] = useState(false);
  const [showPrinceNumber, setShowPrinceNumber] = useState(false);
  const [kingId, setKingId] = useState(null);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setIsPrinceAdded(false);
    setPrinceId(null);
    setPrinceName("");
    setPrinceSearchText("");
    setShowPrinceNumber(false);
  };

  const handleAddPrince = async () => {
    if (!kingId) {
      alert("Set King first.");
      return;
    }

    try {
      const { data: personData } = await axios.get(
        `http://localhost:3001/people/${princeId}`
      );

      // Check if the prince already has a "general" role
      if (personData.role === "general") {
        alert(
          `This person '${princeName}' already has a general role and cannot be added as prince.`
        );
        return;
      }
    } catch (err) {
      console.error("Error checking prince role:", err);
      alert("An error occurred while checking the prince's role.");
      return;
    }

    // Validate if the prince is already added to the barangay
    if (
      selectedBarangay.prince_id &&
      selectedBarangay.prince_id.includes(princeId)
    ) {
      alert(
        `This person is already a prince in '${selectedBarangay.barangay_name}'.`
      );
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to set '${princeName}' as prince of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${princeId}`, {
          role: "prince",
          barangay_id: selectedBarangay._id,
        });

        const response = await axios.post("http://localhost:3001/prince", {
          prince_id: princeId,
          prince_name: princeName,
          barangay_name: selectedBarangay.barangay_name,
          barangay_id: selectedBarangay._id,
          king_id: kingId,
        });

        const newPrinceId = response.data;
        // Update the Barangay's prince field with the new prince
        await axios.put(
          `http://localhost:3001/barangay/${selectedBarangay._id}/prince`,
          {
            prince_id: [...selectedBarangay.prince_id, newPrinceId.prince_id], // Add the new prince to the existing list
          }
        );

        // Update the selectedBarangay in context to trigger re-render
        setSelectedBarangay((prevBarangay) => ({
          ...prevBarangay,
          prince_id: [...prevBarangay.prince_id, newPrinceId.prince_id], // Make sure to include the new prince in the updated state
        }));

        alert("Prince has been added successfully!");
        setShowPrinceNumber(true);
        setIsPrinceAdded(true);
      } catch (err) {
        console.error("Error adding prince:", err);
        alert("An error occurred while adding the prince.");
      }
    }
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );

    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, princeId]);

  const handlePrinceSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPrinceSearchText(value);

    if (!value) {
      setPrinceSuggestions([]);
      setPrinceId(null); // Clear princeId when the search box is cleared
      setPrinceName("");
      onSelectPrince(null);
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

    setPrinceSuggestions(filteredSuggestions);
  };

  const handlePrinceSelect = (person) => {
    setPrinceId(person._id);
    setPrinceName(person.name);
    setPrinceSearchText(person.name);
    setPrinceSuggestions([]);
    setShowPrinceNumber(false);

    // Pass the selected prince's ID and name to the parent component (General)
    onSelectPrince(person._id, person.name);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <King handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <PrinceSearchBox
          searchText={princeSearchText}
          handleSearchChange={handlePrinceSearchChange}
          suggestions={princeSuggestions}
          handlePersonSelect={handlePrinceSelect}
          handleAddPrince={handleAddPrince}
        />
        {isPrinceAdded && showPrinceNumber && (
          <PrinceNumber
            personId={princeId}
            onSuccess={() => {
              setShowPrinceNumber(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
