import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";
import King from "./King";
import CoastalSearchBox from "../components/CoastalSearchBox";

export default function Coastal() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [coastalId, setCoastalId] = useState(null);
  const [coastalName, setCoastalName] = useState("");
  const [coastalSearchText, setCoastalSearchText] = useState("");
  const [coastalSuggestions, setCoastalSuggestions] = useState([]);
  const [kingId, setKingId] = useState(null);
  
  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setCoastalId(null);
    setCoastalName("");
    setCoastalSearchText("");
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, coastalId]);

  const handleCoastalSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setCoastalSearchText(value);

    if (!value) {
      setCoastalSuggestions([]);
      setCoastalName("");
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

    setCoastalSuggestions(filteredSuggestions);
  };

  const handleCoastalSelect = (person) => {
    setCoastalId(person._id);
    setCoastalName(person.name);
    setCoastalSearchText(person.name);
    setCoastalSuggestions([]);
  };

  const handleAddCoastal = async () => {
    if (!kingId) {
      alert("Set King first.");
      return;
    }

    if (selectedBarangay.coastal && selectedBarangay.coastal.includes(coastalId)) {
      alert(`${coastalName} is already a Coastal of ${selectedBarangay.barangay_name}`);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to set '${coastalName}' as Coastal of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${coastalId}`, {
          functionary: "coastal",
          barangay_id: selectedBarangay._id,
        });

        await axios.put(
          `http://localhost:3001/barangay/${selectedBarangay._id}/coastal`,
          {
            coastal: [...selectedBarangay.coastal, coastalId],
          }
        );

        setSelectedBarangay((prevState) => ({
          ...prevState,
          coastal: [...prevState.coastal, coastalId],
        }));

        alert("Coastal has been added successfully!");
        setCoastalSearchText("");
      } catch (err) {
        console.error("Error adding Coastal:", err);
        alert("An error occurred while adding the Coastal.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <King handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <CoastalSearchBox
          searchText={coastalSearchText}
          handleSearchChange={handleCoastalSearchChange}
          suggestions={coastalSuggestions}
          handlePersonSelect={handleCoastalSelect}
          handleAddCoastal={handleAddCoastal}
        />
      </div>
    </div>
  );
}
