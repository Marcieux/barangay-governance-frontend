import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";
import AngatChair from "./AngatChair";
import TanodSearchBox from "../../components/TanodSearchBox";

export default function Tanod() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [tanodId, setTanodId] = useState(null);
  const [tanodName, setTanodName] = useState("");
  const [tanodSearchText, setTanodSearchText] = useState("");
  const [tanodSuggestions, setTanodSuggestions] = useState([]);
  const [acId, setAcId] = useState(null);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setTanodId(null);
    setTanodName("");
    setTanodSearchText("");
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setAcId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, tanodId]);

  const handleTanodSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setTanodSearchText(value);

    if (!value) {
      setTanodSuggestions([]);
      setTanodName("");
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

    setTanodSuggestions(filteredSuggestions);
  };

  const handleTanodSelect = (person) => {
    setTanodId(person._id);
    setTanodName(person.name);
    setTanodSearchText(person.name);
    setTanodSuggestions([]);
  };

  const handleAddTanod = async () => {
    if (!acId) {
      alert("Set Angat Chair first.");
      return;
    }

    if (selectedBarangay.tanod && selectedBarangay.tanod.includes(tanodId)) {
      alert(`${tanodName} is already a Tanod of ${selectedBarangay.barangay_name}`);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to set '${tanodName}' as Tanod of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/people/${tanodId}`, {
          functionary: "tanod",
          barangay_id: selectedBarangay._id,
        });

        await axios.put(
          `${process.env.REACT_APP_API_URL}/barangay/${selectedBarangay._id}/tanod`,
          {
            tanod: [...selectedBarangay.tanod, tanodId],
          }
        );

        setSelectedBarangay((prevState) => ({
          ...prevState,
          tanod: [...prevState.tanod, tanodId],
        }));

        alert("Tanod has been added successfully!");
        setTanodSearchText("");
      } catch (err) {
        console.error("Error adding Tanod:", err);
        alert("An error occurred while adding the Tanod.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <AngatChair handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <TanodSearchBox
          searchText={tanodSearchText}
          handleSearchChange={handleTanodSearchChange}
          suggestions={tanodSuggestions}
          handlePersonSelect={handleTanodSelect}
          handleAddTanod={handleAddTanod}
        />
      </div>
    </div>
  );
}
