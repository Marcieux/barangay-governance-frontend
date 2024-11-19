import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";
import King from "./King";
import BhwSearchBox from "../components/BhwSearchBox";

export default function Bhw() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [bhwId, setBhwId] = useState(null);
  const [bhwName, setBhwName] = useState("");
  const [bhwSearchText, setBhwSearchText] = useState("");
  const [bhwSuggestions, setBhwSuggestions] = useState([]);
  const [kingId, setKingId] = useState(null);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setBhwId(null);
    setBhwName("");
    setBhwSearchText("");
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, bhwId]);

  const handleBhwSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setBhwSearchText(value);

    if (!value) {
      setBhwSuggestions([]);
      setBhwName("");
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

    setBhwSuggestions(filteredSuggestions);
  };

  const handleBhwSelect = (person) => {
    setBhwId(person._id);
    setBhwName(person.name);
    setBhwSearchText(person.name);
    setBhwSuggestions([]);
  };

  const handleAddBhw = async () => {
    if (!kingId) {
      alert("Set King first.");
      return;
    }

    if (selectedBarangay.bhw && selectedBarangay.bhw.includes(bhwId)) {
      alert(`${bhwName} is already a Bhw of ${selectedBarangay.barangay_name}`);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to set '${bhwName}' as Bhw of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${bhwId}`, {
          functionary: "bhw",
          barangay_id: selectedBarangay._id,
        });

        await axios.put(
          `http://localhost:3001/barangay/${selectedBarangay._id}/bhw`,
          {
            bhw: [...selectedBarangay.bhw, bhwId],
          }
        );

        setSelectedBarangay((prevState) => ({
          ...prevState,
          bhw: [...prevState.bhw, bhwId],
        }));

        alert("Bhw has been added successfully!");
        setBhwSearchText("");
      } catch (err) {
        console.error("Error adding Bhw:", err);
        alert("An error occurred while adding the Bhw.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <King handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <BhwSearchBox
          searchText={bhwSearchText}
          handleSearchChange={handleBhwSearchChange}
          suggestions={bhwSuggestions}
          handlePersonSelect={handleBhwSelect}
          handleAddBhw={handleAddBhw}
        />
      </div>
    </div>
  );
}
