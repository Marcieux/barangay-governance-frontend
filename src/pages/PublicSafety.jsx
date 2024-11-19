import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";
import King from "./King";
import PublicSafetySearchBox from "../components/PublicSafetySearchBox";

export default function PublicSafety() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [publicSafetyId, setPublicSafetyId] = useState(null);
  const [publicSafetyName, setPublicSafetyName] = useState("");
  const [publicSafetySearchText, setPublicSafetySearchText] = useState("");
  const [publicSafetySuggestions, setPublicSafetySuggestions] = useState([]);
  const [kingId, setKingId] = useState(null);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setPublicSafetyId(null);
    setPublicSafetyName("");
    setPublicSafetySearchText("");
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, publicSafetyId]);

  const handlePublicSafetySearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPublicSafetySearchText(value);

    if (!value) {
      setPublicSafetySuggestions([]);
      setPublicSafetyName("");
      return;
    }

    const tokens = value.split(" ");

    const filteredSuggestions = filteredPeople
      .filter((person) => person._id !== kingId && person.role !== "prince")
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

    setPublicSafetySuggestions(filteredSuggestions);
  };

  const handlePublicSafetySelect = (person) => {
    setPublicSafetyId(person._id);
    setPublicSafetyName(person.name);
    setPublicSafetySearchText(person.name);
    setPublicSafetySuggestions([]);
  };

  const handleAddPublicSafety = async () => {
    if (!kingId) {
      alert("Set King first.");
      return;
    }

    if (selectedBarangay.public_safety && selectedBarangay.public_safety.includes(publicSafetyId)) {
      alert(`${publicSafetyName} is already a Public Safety of ${selectedBarangay.barangay_name}`);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to set '${publicSafetyName}' as Public Safety of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${publicSafetyId}`, {
          functionary: "public safety",
          barangay_id: selectedBarangay._id,
        });

        await axios.put(
          `http://localhost:3001/barangay/${selectedBarangay._id}/public-safety`,
          {
            public_safety: [...selectedBarangay.public_safety, publicSafetyId],
          }
        );

        setSelectedBarangay((prevState) => ({
          ...prevState,
          public_safety: [...prevState.public_safety, publicSafetyId],
        }));

        alert("Public Safety has been added successfully!");
        setPublicSafetySearchText("");
      } catch (err) {
        console.error("Error adding Public Safety:", err);
        alert("An error occurred while adding the Public Safety.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <King handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <PublicSafetySearchBox
          searchText={publicSafetySearchText}
          handleSearchChange={handlePublicSafetySearchChange}
          suggestions={publicSafetySuggestions}
          handlePersonSelect={handlePublicSafetySelect}
          handleAddPublicSafety={handleAddPublicSafety}
        />
      </div>
    </div>
  );
}
