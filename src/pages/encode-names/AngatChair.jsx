import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import BarangayDropdown from "../../components/BarangayDropdown";
import AngatChairSearchBox from "../../components/AngatChairSearchBox";
import AngatChairNumber from "../../components/AngatChairNumber";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";

export default function AngatChair() {
  const { barangays, selectedBarangay, setSelectedBarangay, setBarangays } =
    useContext(BarangayContext);

  const filteredPeople = useFilteredPeople();
  const [selectedPerson, setSelectedPerson] = useState("");
  const [acId, setAcId] = useState(null);
  const [acName, setAcName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [isAcAdded, setIsAcAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAcNumber, setShowAcNumber] = useState(false);
  const [isAcNumberAssigned, setIsAcNumberAssigned] = useState(false);
  const [canSwitchBarangay, setCanSwitchBarangay] = useState(true);

  useEffect(() => {
    if (acId && isAcAdded && !isAcNumberAssigned) {
      setCanSwitchBarangay(false);
    } else {
      setCanSwitchBarangay(true);
    }
  }, [acId, isAcAdded, isAcNumberAssigned]);

  const handleBarangayChange = (barangay) => {
    if (!canSwitchBarangay) {
      alert(
        "Please assign a number to the added Angat Chair before switching barangays."
      );
      return;
    }
    setSelectedBarangay(barangay);
    resetForm();
  };

  const handleAddAc = async () => {
    if (
      window.confirm(
        `Are you sure you want to set '${acName}' as Angat Chair of '${selectedBarangay.barangay_name}'?`
      )
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${acId}`, {
          role: "angatchair",
        });

        await axios.put(`http://localhost:3001/barangay/${selectedBarangay._id}`, {
          king_id: acId,
          king_name: acName,
        });
        alert("Angat Chair has been added successfully!");
        const { data } = await axios.get("http://localhost:3001/barangay");
        setBarangays(data);

        setSelectedPerson(acId);
        setIsAcAdded(true);
        setShowAcNumber(true);
        setIsAcNumberAssigned(false);
      } catch (err) {
        console.error("Error adding Angat Chair:", err);
        alert("An error occurred while adding the Angat Chair.");
      }
    }
  };

  const resetForm = () => {
    setAcId(null);
    setIsAcAdded(false);
    setIsAcNumberAssigned(false);
    setShowAcNumber(false);
    setCanSwitchBarangay(true);
    setSearchText("");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    if (!value) {
      setSuggestions([]);
      setAcName("");
      return;
    }

    const tokens = value.split(" ");
    const filteredSuggestions = filteredPeople
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

    setSuggestions(filteredSuggestions);
  };

  const handlePersonSelect = (person) => {
    setSelectedPerson(person._id);
    setAcId(person._id);
    setAcName(person.name);
    setSearchText(person.name);
    setSuggestions([]);
    setShowAcNumber(false);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-[400px] space-y-4">
        <BarangayDropdown
          barangays={barangays}
          selectedBarangay={selectedBarangay}
          onBarangayChange={handleBarangayChange}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          disabled={!canSwitchBarangay}
        />
        <AngatChairSearchBox
          barangayWithAc={barangays.find(
            (b) => b._id === selectedBarangay._id
          )}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          suggestions={suggestions}
          handlePersonSelect={handlePersonSelect}
          acId={acId}
          handleAddAc={handleAddAc}
          isAcAdded={isAcAdded}
          acName={acName}
        />
        {!isAcNumberAssigned && showAcNumber && (
          <AngatChairNumber
            personId={selectedPerson}
            onSuccess={() => {
              setShowAcNumber(false);
              setIsAcAdded(true);
              setIsAcNumberAssigned(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
