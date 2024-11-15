import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";
import King from "./King";
import TagapamayapaSearchBox from "../components/TagapamayapaSearchBox";

export default function TagaPamayapa() {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [tagapamayapaId, setTagapamayapaId] = useState(null);
  const [tagapamayapaName, setTagapamayapaName] = useState("");
  const [tagapamayapaSearchText, setTagapamayapaSearchText] = useState("");
  const [tagapamayapaSuggestions, setTagapamayapaSuggestions] = useState([]);
  const [kingId, setKingId] = useState(null);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setTagapamayapaId(null);
    setTagapamayapaName("");
    setTagapamayapaSearchText("");
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );
    if (selectedBarangayData) {
      setKingId(selectedBarangayData.king_id);
    }
  }, [selectedBarangay, barangays, tagapamayapaId]);

  const handleTagapamayapaSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setTagapamayapaSearchText(value);

    if (!value) {
      setTagapamayapaSuggestions([]);
      setTagapamayapaName("");
      return;
    }

    const tokens = value.split(" ");

    const filteredSuggestions = filteredPeople
      .filter(
        (person) =>
          person._id !== kingId &&
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

    setTagapamayapaSuggestions(filteredSuggestions);
  };

  const handleTagapamayapaSelect = (person) => {
    setTagapamayapaId(person._id);
    setTagapamayapaName(person.name);
    setTagapamayapaSearchText(person.name);
    setTagapamayapaSuggestions([]);
  };

  const handleAddTagapamayapa = async () => {
    if (!kingId) {
      alert("Set King first.");
      return;
    }

    if (selectedBarangay.tagapamayapa && selectedBarangay.tagapamayapa.includes(tagapamayapaId)) {
      alert(
        `${tagapamayapaName} is already a Tagapamayapa of ${selectedBarangay.barangay_name}`
      );
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to set '${tagapamayapaName}' as Tagapamayapa of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${tagapamayapaId}`, {
          functionary: "tagapamayapa",
          barangay_id: selectedBarangay._id,
        });

        await axios.put(
          `http://localhost:3001/barangay/${selectedBarangay._id}/tagapamayapa`,
          {
            tagapamayapa: [...selectedBarangay.tagapamayapa, tagapamayapaId],
          }
        );

        setSelectedBarangay((prevState) => ({
          ...prevState,
          tagapamayapa: [...prevState.tagapamayapa, tagapamayapaId],
        }));

        alert("Tagapamayapa has been added successfully!");
        setTagapamayapaSearchText("");
      } catch (err) {
        console.error("Error adding Tagapamayapa:", err);
        alert("An error occurred while adding the Tagapamayapa.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <King handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <TagapamayapaSearchBox
        searchText={tagapamayapaSearchText}
        handleSearchChange={handleTagapamayapaSearchChange}
        suggestions={tagapamayapaSuggestions}
        handlePersonSelect={handleTagapamayapaSelect}
        handleAddTagapamayapa={handleAddTagapamayapa}
        />
      </div>
    </div>
  );
}
