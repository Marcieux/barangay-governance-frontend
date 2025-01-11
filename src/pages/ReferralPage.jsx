import React, { useContext, useState } from "react";
import axios from "axios";
import BarangayDropdown from "../components/BarangayDropdown";
import BarangayContext from "../contexts/BarangayContext";
import { useFilteredPeople } from "../hooks/useBarangayData";
import ReferredBySearchBox from "../components/ReferredBySearchBox";
import ReferralNumber from "../components/ReferralNumber";
import PeopleSearchBox from "../components/PeopleSearchBox";
import PeopleNumber from "../components/PeopleNumber";
import PurokSearchBox from "../components/PurokSearchBox";

export default function ReferralPage() {
  const { barangays, selectedBarangay, setSelectedBarangay } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  // Referral Search
  const [referralId, setReferralId] = useState(null);
  const [referralSearchText, setReferralSearchText] = useState("");
  const [referralSuggestions, setReferralSuggestions] = useState([]);

  // People Search
  const [peopleId, setPeopleId] = useState(null);
  const [peopleSearchText, setPeopleSearchText] = useState("");
  const [peopleSuggestions, setPeopleSuggestions] = useState([]);
  
  const [selectedPurok, setSelectedPurok] = useState("");
  const [personNumber, setPersonNumber] = useState("");

  // Handle barangay changes independently
  const handleFirstBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setReferralId(null);
    setReferralSearchText("");
    setReferralSuggestions([]);
  };

  const handleSecondBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setPeopleId(null);
    setPeopleSearchText("");
    setPeopleSuggestions([]);
  };

  // Handle referral search
  const handleReferralSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setReferralSearchText(value);

    if (!value || !selectedBarangay) {
      setReferralSuggestions([]);
      setReferralId(null);
      return;
    }

    const tokens = value.split(" ");
    const filteredSuggestions = filteredPeople
      .filter(
        (person) =>
          person.barangayId === selectedBarangay.id &&
          person._id !== selectedBarangay.king_id
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

    setReferralSuggestions(filteredSuggestions);
  };

  // Handle people search
  const handlePeopleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPeopleSearchText(value);

    if (!value || !selectedBarangay) {
      setPeopleSuggestions([]);
      setPeopleId(null);
      return;
    }

    const tokens = value.split(" ");
    const filteredSuggestions = filteredPeople
      .filter(
        (person) =>
          person.barangayId === selectedBarangay.id && // Match second barangay
          person._id !== selectedBarangay.king_id // Exclude king
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

    setPeopleSuggestions(filteredSuggestions);
  };

  const handleReferralSelect = (person) => {
    setReferralId(person._id);
    setReferralSearchText(person.name);
    setReferralSuggestions([]);
  };

  const handlePeopleSelect = (person) => {
    setPeopleId(person._id);
    setPeopleSearchText(person.name);
    setPeopleSuggestions([]);
  };

  const handleAddButton = async () => {
    if (!referralId) {
      alert("Please select a referral first.");
      return;
    }

    if (!peopleId) {
      alert("Please select a person first.");
      return;
    }

    // if (!personNumber) {
    //   alert("Please enter a phone number.");
    //   return;
    // }

    // if (personNumber.length !== 11) {
    //   alert("The phone number must be 11 digits.");
    //   return;
    // }

    // if (!/^\d{11}$/.test(personNumber)) {
    //   alert("Phone number must contain only digits.");
    //   return;
    // }

    // if (!selectedPurok) {
    //   alert("Please select a purok.");
    //   return;
    // }

    
    if (
      window.confirm("Click 'Yes' to add the details.")
    ) {
      try {
        await axios.put(`http://localhost:3001/people/${peopleId}`, {
          referred_by: referralSearchText,
          referred_by_id: referralId,
          number: personNumber,
          purok: selectedPurok,
        });

        alert("Referral information added successfully!");
        setReferralId(null);
        setReferralSearchText("");
        setReferralSuggestions([]);
        setPeopleId(null);
        setPeopleSearchText("");
        setPeopleSuggestions([]);
        setPersonNumber("");
        setSelectedPurok("");
      } catch (err) {
        console.error("Error adding referral information:", err);
        alert("An error occurred while adding the referral information.");
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-4">
      <div className="bg-white p-6 rounded shadow-md w-[400px] space-y-4">
        <BarangayDropdown
          onBarangayChange={handleFirstBarangayChange}
          barangays={barangays}
          selectedBarangay={selectedBarangay}
        />
        <ReferredBySearchBox
          searchText={referralSearchText}
          handleSearchChange={handleReferralSearchChange}
          suggestions={referralSuggestions}
          handlePersonSelect={handleReferralSelect}
        />
        <ReferralNumber personId={referralId} />
      </div>

      <div className="bg-white p-6 rounded shadow-md w-[400px] space-y-4">
        <BarangayDropdown
          onBarangayChange={handleSecondBarangayChange}
          barangays={barangays}
          selectedBarangay={selectedBarangay}
        />
        <PeopleSearchBox
          searchText={peopleSearchText}
          handleSearchChange={handlePeopleSearchChange}
          suggestions={peopleSuggestions}
          handlePersonSelect={handlePeopleSelect}
        />
        <PeopleNumber
          personId={peopleId}
          personNumber={personNumber}
          setPersonNumber={setPersonNumber}
        />
        <PurokSearchBox
          onBarangayChange={handleSecondBarangayChange}
          purokList={selectedBarangay?.purok_list || []}
          selectedPurok={selectedPurok}
          setSelectedPurok={setSelectedPurok}
        />
        <div className="flex justify-end">
          <button
            onClick={handleAddButton}
            className="bg-red-500 text-white px-7 py-2 rounded font-semibold text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
