import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";
import AngatChair from "./AngatChair";
import CafguSearchBox from "../../components/CafguSearchBox";

export default function Cafgu() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [cafguId, setCafguId] = useState(null);
  const [cafguName, setCafguName] = useState("");
  const [cafguSearchText, setCafguSearchText] = useState("");
  const [cafguSuggestions, setCafguSuggestions] = useState([]);
  const [acId, setAcId] = useState(null);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setCafguId(null);
    setCafguName("");
    setCafguSearchText("");
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setAcId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, cafguId]);

  const handleCafguSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setCafguSearchText(value);

    if (!value) {
      setCafguSuggestions([]);
      setCafguName("");
      return;
    }

    const tokens = value.split(" ");

    const filteredSuggestions = filteredPeople
      .filter(
        (person) =>
          person._id !== acId &&
          person.role !== "prince"
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

    setCafguSuggestions(filteredSuggestions);
  };

  const handleCafguSelect = (person) => {
    setCafguId(person._id);
    setCafguName(person.name);
    setCafguSearchText(person.name);
    setCafguSuggestions([]);
  };

  const handleAddCafgu = async () => {
    if (!acId) {
      alert("Set Angat Chair first.");
      return;
    }

    // Check if the Cafgu is already added to the selected Barangay
    if (selectedBarangay.cafgu && selectedBarangay.cafgu.includes(cafguId)) {
      alert(
        `${cafguName} is already a Cafgu of ${selectedBarangay.barangay_name}`
      );
      return; // Stop execution if Cafgu already exists in the Barangay
    }

    if (
      window.confirm(
        `Are you sure you want to set '${cafguName}' as cafgu of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${cafguId}`, {
          functionary: "cafgu",
          barangay_id: selectedBarangay._id,
        });

        await axios.put(
          `http://localhost:3001/barangay/${selectedBarangay._id}/cafgu`,
          {
            cafgu: [...selectedBarangay.cafgu, cafguId],
          }
        );

        // Update the selectedBarangay state to reflect the added Cafgu
        setSelectedBarangay((prevState) => ({
          ...prevState,
          cafgu: [...prevState.cafgu, cafguId], // Update the cafgu array
        }));

        alert("Cafgu has been added successfully!");
        setCafguSearchText("");
      } catch (err) {
        console.error("Error adding cafgu:", err);
        alert("An error occurred while adding the cafgu.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <AngatChair handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <CafguSearchBox
          searchText={cafguSearchText}
          handleSearchChange={handleCafguSearchChange}
          suggestions={cafguSuggestions}
          handlePersonSelect={handleCafguSelect}
          handleAddCafgu={handleAddCafgu}
        />
      </div>
    </div>
  );
}
