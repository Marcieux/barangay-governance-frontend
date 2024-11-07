import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import King from "./King";
import PrinceSearchBox from "../components/PrinceSearchBox";
import PrinceNumber from "../components/PrinceNumber";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";

export default function Prince() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [princeId, setPrinceId] = useState(null);
  const [princeName, setPrinceName] = useState("");
  const [princeSearchText, setPrinceSearchText] = useState("");
  const [princeSuggestions, setPrinceSuggestions] = useState([]);
  const [isPrinceAdded, setIsPrinceAdded] = useState(false);
  const [showPrinceNumber, setShowPrinceNumber] = useState(false);
  const [kingId, setKingId] = useState(null);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setIsPrinceAdded(false);
    setPrinceId(null);
    setPrinceName("");
    setPrinceSearchText("");
    setShowPrinceNumber(false);
  };

  const handleAddPrince = async () => {
    if (!kingId) {
      alert("Set King first.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to set '${princeName}' as prince of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${princeId}`, {
          role: "prince",
          barangay_id: selectedBarangay._id,
        });

        const response = await axios.post("http://localhost:3001/prince", {
          prince_id: princeId,
          prince_name: princeName,
          barangay_name: selectedBarangay.barangay_name,
          barangay_id: selectedBarangay._id,
          king_id: kingId,
        });

        const newPrinceId = response.data._id;

        await axios.put(
          `http://localhost:3001/barangay/${selectedBarangay._id}/prince`,
          {
            prince: [newPrinceId],
          }
        );

        alert("Prince has been added successfully!");
        setShowPrinceNumber(true);
        setIsPrinceAdded(true);
      } catch (err) {
        console.error("Error adding prince:", err);
        alert("ERROR: A Prince has been added already in the barangay");
      }
    }
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );

    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, princeId]);

  const handlePrinceSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPrinceSearchText(value);

    if (!value) {
      setPrinceSuggestions([]);
      setPrinceName("");
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

    setPrinceSuggestions(filteredSuggestions);
  };

  const handlePrinceSelect = (person) => {
    setPrinceId(person._id);
    setPrinceName(person.name);
    setPrinceSearchText(person.name);
    setPrinceSuggestions([]);
    setShowPrinceNumber(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <King handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <PrinceSearchBox
          searchText={princeSearchText}
          handleSearchChange={handlePrinceSearchChange}
          suggestions={princeSuggestions}
          handlePersonSelect={handlePrinceSelect}
          handleAddPrince={handleAddPrince}
        />
        {isPrinceAdded && showPrinceNumber && (
          <PrinceNumber
            personId={princeId}
            onSuccess={() => {
              setShowPrinceNumber(false);
              setPrinceSearchText("");
            }}
          />
        )}
      </div>
    </div>
  );
}
