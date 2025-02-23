import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import AngatChair from "./AngatChair";
import BcoSearchBox from "../../components/BcoSearchBox";
import BcoPurok from "../../components/BcoPurok";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";

export default function Bco({ onSelectBco = () => {} }) {
  const { selectedBarangay, setSelectedBarangay, barangays } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [bcoId, setBcoId] = useState(null);
  const [bcoName, setBcoName] = useState("");
  const [bcoSearchText, setBcoSearchText] = useState("");
  const [bcoSuggestions, setBcoSuggestions] = useState([]);
  const [acId, setAcId] = useState(null);
  const [acName, setAcName] = useState("");
  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setBcoId(null);
    setBcoName("");
    setBcoSearchText("");
  };

  const handleAddBco = async () => {
    if (!acId) {
      alert("Set Angat Chair first.");
      return;
    }

    try {
      const { data: personData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/people/${bcoId}`
      );

      const restrictedRoles = ["bco", "pcs", "pcl", "fm"];
      if (restrictedRoles.includes(personData.role)) {
        alert(
          `This person '${bcoName}' already holds the role of '${personData.role}' and cannot be added as an BCO.`
        );
        return;
      }

      // Retrieve the precinct data from the personData
      const { precinct } = personData;

      // Validate if the prince is already added to the barangay
      if (
        selectedBarangay.prince_id &&
        selectedBarangay.prince_id.includes(bcoId)
      ) {
        alert(
          `This person is already BCO in '${selectedBarangay.barangay_name}'.`
        );
        return;
      }

      if (
        window.confirm(
          `Are you sure you want to set '${bcoName}' as an BCO of '${selectedBarangay.barangay_name}'?`
        )
      ) {
        try {
          await axios.put(`${process.env.REACT_APP_API_URL}/people/${bcoId}`, {
            role: "bco"
          });

          const response = await axios.post(`${process.env.REACT_APP_API_URL}/prince`, {
            prince_id: bcoId,
            prince_name: bcoName,
            barangay_name: selectedBarangay.barangay_name,
            barangay_id: selectedBarangay._id,
            king_id: acId,
            king_name: acName,
            precinct: precinct,
          });

          const newBcoId = response.data;
          // Update the Barangay's prince field with the new prince
          await axios.put(
            `${process.env.REACT_APP_API_URL}/barangay/${selectedBarangay._id}/prince`,
            {
              prince_id: [...selectedBarangay.prince_id, newBcoId.prince_id], // Add the new prince to the existing list
            }
          );

          // Update the selectedBarangay in context to trigger re-render
          setSelectedBarangay((prevBarangay) => ({
            ...prevBarangay,
            prince_id: [...prevBarangay.prince_id, newBcoId.prince_id], // Make sure to include the new prince in the updated state
          }));

          alert("BCO has been added successfully!");
        } catch (err) {
          console.error("Error adding BCO:", err);
          alert("An error occurred while adding the BCO.");
        }
      }
    } catch (err) {
      console.error("Error fetching BCO data:", err);
      alert("An error occurred while fetching the BCO's data.");
    }
  };

  useEffect(() => {
    const selectedBarangayData = barangays.find(
      (b) => b.barangay_name === selectedBarangay.barangay_name
    );

    if (selectedBarangayData) {
      setAcId(selectedBarangayData.king_id);
      setAcName(selectedBarangayData.king_name);
    }
  }, [selectedBarangay, barangays]);

  const handleBcoSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setBcoSearchText(value);

    if (!value) {
      setBcoSuggestions([]);
      setBcoId(null); // Clear princeId when the search box is cleared
      setBcoName("");
      onSelectBco(null);
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

    setBcoSuggestions(filteredSuggestions);
  };

  const handleBcoSelect = (person) => {
    setBcoId(person._id);
    setBcoName(person.name);
    setBcoSearchText(person.name);
    setBcoSuggestions([]);

    // Pass the selected prince's ID and name to the parent component (General)
    onSelectBco(person._id, person.name);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <AngatChair handleBarangayChange={handleBarangayChange} />
      <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
        <BcoSearchBox
          searchText={bcoSearchText}
          handleSearchChange={handleBcoSearchChange}
          suggestions={bcoSuggestions}
          handlePersonSelect={handleBcoSelect}
          handleAddBco={handleAddBco}
        />
        <BcoPurok personId={bcoId} />
      </div>
    </div>
  );
}
