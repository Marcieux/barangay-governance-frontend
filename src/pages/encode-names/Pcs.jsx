import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";
import Bco from "./Bco";
import PcsSearchBox from "../../components/PcsSearchBox";
import PcsPurok from "../../components/PcsPurok";

export default function Pcs() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [pcsId, setPcsId] = useState(null);
  const [pcsName, setPcsName] = useState("");
  const [pcsSearchText, setPcsSearchText] = useState("");
  const [pcsSuggestions, setPcsSuggestions] = useState([]);
  const [acId, setAcId] = useState(null);
  const [acName, setAcName] = useState("");

  // Track prince data
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

  const handlePcsSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPcsSearchText(value);

    if (!value) {
      setPcsSuggestions([]);
      setPcsId(null);
      setPcsName("");
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

    setPcsSuggestions(filteredSuggestions);
  };

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setPcsId(null);
    setPcsName("");
    setPcsSearchText("");
  };

  const handleAddPcs = async () => {
    if (!acId) {
      alert("Set Angat Chair first.");
      return;
    }

    if (!bcoId) {
      alert("Select an BCO first.");
      return;
    }

    try {
      const { data: personData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/people/${pcsId}`
      );

      // Check if the selected person is already a prince
      const restrictedRoles = ["bco", "pcs", "pcl", "fm"];
      if (restrictedRoles.includes(personData.role)) {
        alert(
          `This person '${pcsName}' already holds the role of '${personData.role}' and cannot be added as a PCS.`
        );
        return;
      }

      // Retrieve the precinct data from the personData
      const { precinct } = personData;

      if (
        window.confirm(
          `Are you sure you want to set '${pcsName}' as PCS of '${selectedBarangay.barangay_name}'?`
        )
      ) {
        await axios.put(`${process.env.REACT_APP_API_URL}/people/${pcsId}`, {
          role: "pcs",
        });

        await axios.post(`${process.env.REACT_APP_API_URL}/general`, {
          general_id: pcsId,
          general_name: pcsName,
          precinct: precinct,
          barangay_name: selectedBarangay.barangay_name,
          barangay_id: selectedBarangay._id,
          king_id: acId,
          king_name: acName,
          prince_id: bcoId,
          prince_name: bcoName,
        });

        alert("PCS has been added successfully!");
      }
    } catch (err) {
      console.error("Error adding PCS:", err);
      alert("An error occurred while adding the PCS.");
    }
  };

  const handlePcsSelect = (person) => {
    setPcsId(person._id);
    setPcsName(person.name);
    setPcsSearchText(person.name);
    setPcsSuggestions([]);
  };

  const handleSelectBco = (id, name) => {
    setBcoId(id); // Set selected prince ID
    setBcoName(name); // Set selected prince name
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Bco
        handleBarangayChange={handleBarangayChange}
        onSelectBco={handleSelectBco}
      />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <PcsSearchBox
          searchText={pcsSearchText}
          handleSearchChange={handlePcsSearchChange}
          suggestions={pcsSuggestions}
          handlePersonSelect={handlePcsSelect}
          handleAddPcs={handleAddPcs}
        />
        <PcsPurok personId={pcsId} />
      </div>
    </div>
  );
}
