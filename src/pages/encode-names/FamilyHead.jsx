import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";
import AngatChair from "./AngatChair";
import PcsSelector from "../../components/PcsSelector";
import Pcl from "../../components/Pcl";
export default function FamilyHead() {
  const { selectedBarangay, setSelectedBarangay, people, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [pcsSearchText, setPcsSearchText] = useState("");
  const [filteredPcs, setFilteredPcs] = useState([]);

  const [pclId, setPclId] = useState(null);
  const [pclName, setPclName] = useState("");
  const [pclSearchText, setPclSearchText] = useState("");
  const [pclSuggestions, setPclSuggestions] = useState([]);
  const [acId, setAcId] = useState(null);
  const [acName, setAcName] = useState("");

  // Track pcs data
  const [pcsId, setPcsId] = useState(null);
  const [pcsName, setPcsName] = useState("");

  // Track bco data
  const [bcoId, setBcoId] = useState(null);
  const [bcoName, setBcoName] = useState("");

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setAcId(selectedBarangayData.king_id);
      setAcName(selectedBarangayData.king_name);
    }
  }, [selectedBarangay, barangays]);

  const handlePclSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPclSearchText(value);

    if (!value) {
      setPclSuggestions([]);
      setPclId(null);
      setPclName("");
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

    setPclSuggestions(filteredSuggestions);
  };

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setPcsSearchText("");
    setFilteredPcs([]);
    setPclId(null);
    setPclName("");
    setPclSearchText("");
  };

  const handlePcsSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPcsSearchText(value);

    if (!value) {
      setFilteredPcs([]);
      setPcsSearchText("");
      setPcsId(null);
      setPcsName("");
      return;
    }

    const filtered = people.filter(
      (person) =>
        person.barangay_id === selectedBarangay._id &&
        person.role === "pcs" &&
        person.name.toLowerCase().includes(value)
    );
    setFilteredPcs(filtered);
  };

  const handlePcsSelect = async (person) => {
    setPcsId(person._id);
    setPcsName(person.name);
    setPcsSearchText(person.name);
    setFilteredPcs([]);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/general/${person._id}`
      );
      const pcsData = response.data.data;

      setBcoId(pcsData.prince_id);
      setBcoName(pcsData.prince_name);
    } catch (error) {
      console.error("Error fetching PCS data:", error);
    }
  };

  const handleAddPcl = async () => {
    if (!acId) {
      alert("Set Angat Chair first.");
      return;
    }

    if (!pcsId) {
      alert("Select a PCS first.");
      return;
    }

    try {
      const { data: personData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/people/${pclId}`
      );

      // Check if the selected person already has restricted roles
      const restrictedRoles = ["bco", "pcs", "pcl", "fm"];
      if (restrictedRoles.includes(personData.role)) {
        alert(
          `This person '${pclName}' already holds the role of '${personData.role}' and cannot be added as an PCL.`
        );
        return;
      }

      const { precinct } = personData;

      if (
        window.confirm(
          `Are you sure you want to set '${pclName}' as PCL of '${selectedBarangay.barangay_name}'?`
        )
      ) {
        await axios.put(`${process.env.REACT_APP_API_URL}/people/${pclId}`, {
          role: "pcl",
        });

        await axios.post(`${process.env.REACT_APP_API_URL}/leader`, {
          leader_id: pclId,
          leader_name: pclName,
          precinct: precinct,
          barangay_name: selectedBarangay.barangay_name,
          barangay_id: selectedBarangay._id,
          king_id: acId,
          king_name: acName,
          general_id: pcsId,
          general_name: pcsName,
          prince_id: bcoId,
          prince_name: bcoName,
        });

        alert("PCL has been added successfully!");
      }
    } catch (err) {
      console.error("Error adding PCL:", err);
      alert("An error occurred while adding the PCL.");
    }
  };

  const handlePclSelect = (person) => {
    setPclId(person._id);
    setPclName(person.name);
    setPclSearchText(person.name);
    setPclSuggestions([]);
  };

  return (
    <div className="pclex pclex-col items-center justify-center">
      <AngatChair handleBarangayChange={handleBarangayChange} />
      <PcsSelector
        searchText={pcsSearchText}
        suggestions={filteredPcs}
        handleSearchChange={handlePcsSearchChange}
        handlePersonSelect={handlePcsSelect}
      />
      <Pcl
        searchText={pclSearchText}
        suggestions={pclSuggestions}
        handleSearchChange={handlePclSearchChange}
        handlePersonSelect={handlePclSelect}
        handleAddPcl={handleAddPcl}
        personId={pclId}
      />
    </div>
  );
}
