import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";
import King from "./King";
import GeneralSelector from "../components/GeneralSelector";
import FamilyLeader from "../components/FamilyLeader";
export default function FamilyHead() {
  const { selectedBarangay, setSelectedBarangay, people, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [generalSearchText, setGeneralSearchText] = useState("");
  const [filteredGenerals, setFilteredGenerals] = useState([]);

  const [flId, setFlId] = useState(null);
  const [flName, setFlName] = useState("");
  const [flSearchText, setFlSearchText] = useState("");
  const [flSuggestions, setFlSuggestions] = useState([]);
  const [kingId, setKingId] = useState(null);
  const [kingName, setKingName] = useState("");

  // Track general data
  const [generalId, setGeneralId] = useState(null);
  const [generalName, setGeneralName] = useState("");

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
      setKingName(selectedBarangayData.king_name);
    }
  }, [selectedBarangay, barangays]);

  const handleFlSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFlSearchText(value);

    if (!value) {
      setFlSuggestions([]);
      setFlId(null);
      setFlName("");
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

    setFlSuggestions(filteredSuggestions);
  };

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setGeneralSearchText("");
    setFilteredGenerals([]);
    setFlId(null);
    setFlName("");
    setFlSearchText("");
  };

  const handleGeneralSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setGeneralSearchText(value);

    if (!value) {
      setFilteredGenerals([]);
      setGeneralSearchText("");
      setGeneralId(null);
      setGeneralName("");
      return;
    }

    const filtered = people.filter(
      (person) =>
        person.barangay_id === selectedBarangay._id &&
        person.role === "general" &&
        person.name.toLowerCase().includes(value)
    );
    setFilteredGenerals(filtered);
  };

  const handleGeneralSelect = (person) => {
    setGeneralId(person._id);
    setGeneralName(person.name);
    setGeneralSearchText(person.name);
    setFilteredGenerals([]);
  };

  const handleAddFl = async () => {
    if (!kingId) {
      alert("Set Angat Chair first.");
      return;
    }

    if (!generalId) {
      alert("Select an APC first.");
      return;
    }

    try {
      const { data: personData } = await axios.get(
        `http://localhost:3001/people/${flId}`
      );

      // Check if the selected person already has restricted roles
      const restrictedRoles = ["leader", "prince", "general"];
      if (restrictedRoles.includes(personData.role)) {
        alert(
          `This person '${flName}' already holds the role of '${personData.role}' and cannot be added as an FL.`
        );
        return;
      }

      const { precinct } = personData;

      if (
        window.confirm(
          `Are you sure you want to set '${flName}' as FL of '${selectedBarangay.barangay_name}'?`
        )
      ) {
        await axios.put(`http://localhost:3001/people/${flId}`, {
          role: "leader",
          barangay_id: selectedBarangay._id,
        });

        await axios.post("http://localhost:3001/leader", {
          leader_id: flId,
          leader_name: flName,
          precinct: precinct,
          barangay_name: selectedBarangay.barangay_name,
          barangay_id: selectedBarangay._id,
          king_id: kingId,
          king_name: kingName,
          general_id: generalId,
          general_name: generalName,
        });

        alert("FL has been added successfully!");
      }
    } catch (err) {
      console.error("Error adding FL:", err);
      alert("An error occurred while adding the FL.");
    }
  };

  const handleFlSelect = (person) => {
    setFlId(person._id);
    setFlName(person.name);
    setFlSearchText(person.name);
    setFlSuggestions([]);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <King handleBarangayChange={handleBarangayChange} />
      <GeneralSelector
        searchText={generalSearchText}
        suggestions={filteredGenerals}
        handleSearchChange={handleGeneralSearchChange}
        handlePersonSelect={handleGeneralSelect}
      />
      <FamilyLeader
        searchText={flSearchText}
        suggestions={flSuggestions}
        handleSearchChange={handleFlSearchChange}
        handlePersonSelect={handleFlSelect}
        handleAddFl={handleAddFl}
        personId={flId}
      />
    </div>
  );
}
