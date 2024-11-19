import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";
import King from "./King";
import BantayDagatSearchBox from "../components/BantayDagatSearchBox";

export default function BantayDagat() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [bantayDagatId, setBantayDagatId] = useState(null);
  const [bantayDagatName, setBantayDagatName] = useState("");
  const [bantayDagatSearchText, setBantayDagatSearchText] = useState("");
  const [bantayDagatSuggestions, setBantayDagatSuggestions] = useState([]);
  const [kingId, setKingId] = useState(null);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setBantayDagatId(null);
    setBantayDagatName("");
    setBantayDagatSearchText("");
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, bantayDagatId]);

  const handleBantayDagatSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setBantayDagatSearchText(value);

    if (!value) {
      setBantayDagatSuggestions([]);
      setBantayDagatName("");
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

    setBantayDagatSuggestions(filteredSuggestions);
  };

  const handleBantayDagatSelect = (person) => {
    setBantayDagatId(person._id);
    setBantayDagatName(person.name);
    setBantayDagatSearchText(person.name);
    setBantayDagatSuggestions([]);
  };

  const handleAddBantayDagat = async () => {
    if (!kingId) {
      alert("Set King first.");
      return;
    }

    if (selectedBarangay.bantay_dagat && selectedBarangay.bantay_dagat.includes(bantayDagatId)) {
      alert(`${bantayDagatName} is already a BantayDagat of ${selectedBarangay.barangay_name}`);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to set '${bantayDagatName}' as Bantay Dagat of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${bantayDagatId}`, {
          functionary: "bantay dagat",
          barangay_id: selectedBarangay._id,
        });

        await axios.put(
          `http://localhost:3001/barangay/${selectedBarangay._id}/bantay-dagat`,
          {
            bantay_dagat: [...selectedBarangay.bantay_dagat, bantayDagatId],
          }
        );

        setSelectedBarangay((prevState) => ({
          ...prevState,
          bantay_dagat: [...prevState.bantay_dagat, bantayDagatId],
        }));

        alert("Bantay Dagat has been added successfully!");
        setBantayDagatSearchText("");
      } catch (err) {
        console.error("Error adding Bantay Dagat:", err);
        alert("An error occurred while adding the Bantay Dagat.");
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <King handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <BantayDagatSearchBox
          searchText={bantayDagatSearchText}
          handleSearchChange={handleBantayDagatSearchChange}
          suggestions={bantayDagatSuggestions}
          handlePersonSelect={handleBantayDagatSelect}
          handleAddBantayDagat={handleAddBantayDagat}
        />
      </div>
    </div>
  );
}
