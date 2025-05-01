import React, { useContext, useState } from "react";
import BarangayDropdown from "../../components/BarangayDropdown";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";
import PeopleSearchBox from "../../components/PeopleSearchBox";
import AssistanceType from "../../components/AssistanceType";
export default function Assistance() {
  const { barangays, selectedBarangay, setSelectedBarangay } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  const [personId, setPersonId] = useState(null);
  const [personName, setPersonName] = useState("");
  const [personSearchText, setPersonSearchText] = useState("");
  const [personSuggestions, setPersonSuggestions] = useState([]);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setPersonId(null);
    setPersonName("")
    setPersonSearchText("");
    setPersonSuggestions([]);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPersonSearchText(value);
    if (!value) {
      setPersonSuggestions([]);
      setPersonId(null);
      setPersonName("");
      return;
    }

    const tokens = value.split(" ");

    const filteredSuggestions = filteredPeople
      .filter((person) => person._id !== selectedBarangay.king_id)
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

    setPersonSuggestions(filteredSuggestions);
  };

  const handlePersonSelect = (person) => {
    setPersonId(person._id);
    setPersonName(person.name)
    setPersonSearchText(person.name);
    setPersonSuggestions([]);
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-[400px] space-y-4">
        <BarangayDropdown
          onBarangayChange={handleBarangayChange}
          barangays={barangays}
          selectedBarangay={selectedBarangay}
        />
        <PeopleSearchBox
          searchText={personSearchText}
          handleSearchChange={handleSearchChange}
          suggestions={personSuggestions}
          handlePersonSelect={handlePersonSelect}
        />
        <AssistanceType
          personId={personId}
          personName={personName}
        />
      </div>
    </div>
  );
}
