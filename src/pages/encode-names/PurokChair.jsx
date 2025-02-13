import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";
import PurokChairSearchBox from "../../components/PurokChairSearchBox";
import AngatChair from "./AngatChair";

export default function PurokChair() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [purokChairId, setPurokChairId] = useState(null);
  const [purokChairName, setPurokChairName] = useState("");
  const [purokChairSearchText, setPurokChairSearchText] = useState("");
  const [purokChairSuggestions, setPurokChairSuggestions] = useState([]);
  const [acId, setAcId] = useState(null);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setPurokChairId(null);
    setPurokChairName("");
    setPurokChairSearchText("");
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setAcId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, purokChairId]);

  const handlePurokChairSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPurokChairSearchText(value);

    if (!value) {
      setPurokChairSuggestions([]);
      setPurokChairName("");
      return;
    }

    const tokens = value.split(" ");

    const filteredSuggestions = filteredPeople
      .filter((person) => person._id !== acId && person.role !== "prince")
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

    setPurokChairSuggestions(filteredSuggestions);
  };

  const handlePurokChairSelect = (person) => {
    setPurokChairId(person._id);
    setPurokChairName(person.name);
    setPurokChairSearchText(person.name);
    setPurokChairSuggestions([]);
  };

  const handleAddPurokChair = async () => {
    if (!acId) {
      alert("Set Angat Chair first.");
      return;
    }

    if (selectedBarangay.purok_chair && selectedBarangay.purok_chair.includes(purokChairId)) {
      alert(
        `${purokChairName} is already a Purok Chair of ${selectedBarangay.barangay_name}`
      );
      return; 
    }

    if (
      window.confirm(
        `Are you sure you want to set '${purokChairName}' as Purok Chair of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${purokChairId}`, {
          functionary: "purok chair",
          barangay_id: selectedBarangay._id,
        });

        await axios.put(
          `http://localhost:3001/barangay/${selectedBarangay._id}/purok-chair`,
          {
            purok_chair: [...selectedBarangay.purok_chair, purokChairId],
          }
        );

        setSelectedBarangay((prevState) => ({
          ...prevState,
          purok_chair: [...prevState.purok_chair, purokChairId],
        }));

        alert("Purok Chair has been added successfully!");
        setPurokChairSearchText("");
      } catch (err) {
        console.error("Error adding purok chair:", err);
        alert("An error occurred while adding the purok chair.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <AngatChair handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <PurokChairSearchBox 
        searchText={purokChairSearchText}
        handleSearchChange={handlePurokChairSearchChange}
        suggestions={purokChairSuggestions}
        handlePersonSelect={handlePurokChairSelect}
        handleAddPurokChair={handleAddPurokChair}
        />
      </div>
    </div>
  );
}
