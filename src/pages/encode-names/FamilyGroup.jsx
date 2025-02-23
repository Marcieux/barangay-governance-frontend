import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";
import AngatChair from "./AngatChair";
import PclSelector from "../../components/PclSelector";
import FamilyMember from "../../components/FamilyMember";
export default function FamilyGroup() {
  const { selectedBarangay, setSelectedBarangay, people, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [pclSearchText, setPclSearchText] = useState("");
  const [filteredPcl, setFilteredPcl] = useState([]);

  const [fmId, setFmId] = useState(null);
  const [fmName, setFmName] = useState("");
  const [fmSearchText, setFmSearchText] = useState("");
  const [fmSuggestions, setFmSuggestions] = useState([]);
  const [acId, setAcId] = useState(null);
  const [acName, setAcName] = useState("");

    
  // Track bco data
  const [bcoId, setBcoId] = useState(null);
  const [bcoName, setBcoName] = useState("");

  // Track pcs data
  const [pcsId, setPcsId] = useState(null);
  const [pcsName, setPcsName] = useState("");

  // Track pcl data
  const [pclId, setPclId] = useState(null);
  const [pclName, setPclName] = useState("");

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setAcId(selectedBarangayData.king_id);
      setAcName(selectedBarangayData.king_name);
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
      .filter((person) => person._id !== acId)
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
    setPclSearchText("");
    setFilteredPcl([]);
    setFmId(null);
    setFmName("");
    setFmSearchText("");
  };
  
  const handlePclSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPclSearchText(value);

    if (!value) {
      setFilteredPcl([]);
      setPclSearchText("");
      setPclId(null);
      setPclName("");
      return;
    }

    const filtered = people.filter(
      (person) =>
        person.barangay_id === selectedBarangay._id &&
        person.role === "pcl" &&
        person.name.toLowerCase().includes(value)
    );
    setFilteredPcl(filtered);
  };

  const handlePclSelect = async (person) => {
    setPclId(person._id);
    setPclName(person.name);
    setPclSearchText(person.name);
    setFilteredPcl([]);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/leader/${person._id}`
      );
      const pclData = response.data.data;

      setBcoId(pclData.prince_id);
      setBcoName(pclData.prince_name);
      setPcsId(pclData.general_id);
      setPcsName(pclData.general_name);
    } catch (error) {
      console.error("Error fetching PCL data:", error);
    }
  };

  const handleAddFm = async () => {
    if (!acId) {
      alert("Set Angat Chair first.");
      return;
    }

    if (!pclId) {
      alert("Select PCL first.");
      return;
    }
   
    try {
      const { data: personData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/people/${fmId}`
      );

      // Check if the selected person already has restricted roles
      const restrictedRoles = ["bco", "pcs", "pcl", "fm"];
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
        await axios.put(`${process.env.REACT_APP_API_URL}/people/${fmId}`, {
          role: "fm"
        });

        await axios.post(`${process.env.REACT_APP_API_URL}/member`, {
          member_id: fmId,
          member_name: fmName,
          precinct: precinct,
          barangay_name: selectedBarangay.barangay_name,
          barangay_id: selectedBarangay._id,
          king_id: acId,
          king_name: acName,
          prince_id: bcoId,
          prince_name: bcoName,
          general_id: pcsId,
          general_name: pcsName,
          leader_id: pclId,
          leader_name: pclName,
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
      <AngatChair handleBarangayChange={handleBarangayChange} />
      <PclSelector 
        searchText={pclSearchText}
        suggestions={filteredPcl}
        handleSearchChange={handlePclSearchChange}
        handlePersonSelect={handlePclSelect}
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
