import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";
import King from "./King";
import LeaderSelector from "../components/LeaderSelector";
import FamilyMember from "../components/FamilyMember";
export default function FamilyGroup() {
  const { selectedBarangay, setSelectedBarangay, people, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [leaderSearchText, setLeaderSearchText] = useState("");
  const [filteredLeaders, setFilteredLeaders] = useState([]);

  const [fmId, setFmId] = useState(null);
  const [fmName, setFmName] = useState("");
  const [fmSearchText, setFmSearchText] = useState("");
  const [fmSuggestions, setFmSuggestions] = useState([]);
  const [kingId, setKingId] = useState(null);
  const [kingName, setKingName] = useState("");

  // Track leader data
  const [leaderId, setLeaderId] = useState(null);
  const [leaderName, setLeaderName] = useState("");

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
      setKingName(selectedBarangayData.king_name);
    }
  }, [selectedBarangay, barangays]);

  const handleFmSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFmSearchText(value);

    if (!value) {
      setFmSuggestions([]);
      setFmId(null);
      setFmName("");
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

    setFmSuggestions(filteredSuggestions);
  };

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setLeaderSearchText("");
    setFilteredLeaders([]);
    setFmId(null);
    setFmName("");
    setFmSearchText("");
  };
  
  const handleLeaderSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setLeaderSearchText(value);

    if (!value) {
      setFilteredLeaders([]);
      setLeaderSearchText("");
      setLeaderId(null);
      setLeaderName("");
      return;
    }

    const filtered = people.filter(
      (person) =>
        person.barangay_id === selectedBarangay._id &&
        person.role === "leader" &&
        person.name.toLowerCase().includes(value)
    );
    setFilteredLeaders(filtered);
  };

  const handleLeaderSelect = (person) => {
    setLeaderId(person._id);
    setLeaderName(person.name);
    setLeaderSearchText(person.name);
    setFilteredLeaders([]);
  };

  const handleAddFm = async () => {
    if (!kingId) {
      alert("Set Angat Chair first.");
      return;
    }

    if (!leaderId) {
      alert("Select FL first.");
      return;
    }

    try {
      const { data: personData } = await axios.get(
        `http://localhost:3001/people/${fmId}`
      );

      // Check if the selected person already has restricted roles
      const restrictedRoles = ["member", "leader", "prince", "general"];
      if (restrictedRoles.includes(personData.role)) {
        alert(
          `This person '${fmName}' already holds the role of '${personData.role}' and cannot be added as an FM.`
        );
        return;
      }

      const { precinct } = personData;

      if (
        window.confirm(
          `Are you sure you want to set '${fmName}' as FM of '${selectedBarangay.barangay_name}'?`
        )
      ) {
        await axios.put(`http://localhost:3001/people/${fmId}`, {
          role: "member"
        });

        await axios.post("http://localhost:3001/member", {
          member_id: fmId,
          member_name: fmName,
          precinct: precinct,
          barangay_name: selectedBarangay.barangay_name,
          barangay_id: selectedBarangay._id,
          king_id: kingId,
          king_name: kingName,
          leader_id: leaderId,
          leader_name: leaderName,
        });

        alert("FM has been added successfully!");
      }
    } catch (err) {
      console.error("Error adding FM:", err);
      alert("An error occurred while adding the FM.");
    }
  };

  const handleFmSelect = (person) => {
    setFmId(person._id);
    setFmName(person.name);
    setFmSearchText(person.name);
    setFmSuggestions([]);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <King handleBarangayChange={handleBarangayChange} />
      <LeaderSelector 
        searchText={leaderSearchText}
        suggestions={filteredLeaders}
        handleSearchChange={handleLeaderSearchChange}
        handlePersonSelect={handleLeaderSelect}
      />
      <FamilyMember
        searchText={fmSearchText}
        suggestions={fmSuggestions}
        handleSearchChange={handleFmSearchChange}
        handlePersonSelect={handleFmSelect}
        handleAddFm={handleAddFm}
        personId={fmId}
      />
    </div>
  );
}
