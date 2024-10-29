import React, { useState, useEffect } from "react";
import axios from "axios";

export default function King() {
  // State variables to hold data and selections
  const [barangays, setBarangays] = useState([]); // List of barangays
  const [people, setPeople] = useState([]); // List of people
  const [selectedBarangay, setSelectedBarangay] = useState(""); // Selected barangay name
  const [filteredPeople, setFilteredPeople] = useState([]); // People belonging to the selected barangay
  const [selectedPerson, setSelectedPerson] = useState(""); // Selected person ID for king
  const [king, setKing] = useState(null); // ID of selected person as king
  const [kingName, setKingName] = useState(""); // Name of the selected king

  useEffect(() => {
    // Fetch all barangays from the backend
    const fetchBarangays = async () => {
      try {
        const response = await axios.get("http://localhost:3001/barangay");
        setBarangays(response.data);
      } catch (err) {
        console.error("Error fetching barangays:", err);
      }
    };

    // Fetch all people from the backend
    const fetchPeople = async () => {
      try {
        const response = await axios.get("http://localhost:3001/people");
        setPeople(response.data);
      } catch (err) {
        console.error("Error fetching people:", err);
      }
    };

    fetchBarangays();
    fetchPeople();
  }, []);

  // Update the list of people when a barangay is selected
  useEffect(() => {
    if (selectedBarangay) {
      // Filter people based on the selected barangay
      const filtered = people.filter(
        (person) => person.barangay === selectedBarangay
      );
      setFilteredPeople(filtered);
    } else {
      setFilteredPeople([]);
    }
  }, [selectedBarangay, people]);

  // Handle barangay selection changes
  const handleBarangayChange = (event) => {
    setSelectedBarangay(event.target.value);
    setSelectedPerson("");
    setKing(null);

    // Set king name if the selected barangay already has a king
    const barangay = barangays.find(
      (b) => b.barangay_name === event.target.value
    );
    if (barangay?.king_name) {
      setKingName(barangay.king_name);
    } else {
      setKingName("");
    }
  };

  // Handle selection of a person to set as king
  const handlePersonChange = (event) => {
    setSelectedPerson(event.target.value);
    const person = people.find((p) => p._id === event.target.value);
    setKing(person?._id);
    setKingName(person?.name);
  };

  // Confirm and save the selected person as king in the backend
  const handleAddKing = async () => {
    if (
      window.confirm(
        `Are you sure you want to set '${kingName}' as king of '${selectedBarangay}'?`
      )
    ) {
      try {
        console.log(
          `Attempting to set '${kingName}' as king of '${selectedBarangay}'`
        );

        // Update barangay's king information in the backend
        await axios.put(`http://localhost:3001/barangay/${selectedBarangay}`, {
          king,
          king_name: kingName,
        });

        console.log(
          `King '${kingName}' added successfully for '${selectedBarangay}'`
        );
        alert("King has been added successfully!");

        setKing(null);
        setSelectedPerson("");
        setFilteredPeople([]);
      } catch (err) {
        console.error("Error adding king:", err);
        alert("An error occurred while adding the king.");
      }
    }
  };

  // Find if the selected barangay already has a king
  const barangayWithKing = barangays.find(
    (b) => b.barangay_name === selectedBarangay
  );

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6">
      {/* Barangay selection dropdown */}
      <div>
        <h1 className="text-xl font-semibold mb-2">Select Barangay</h1>
        <select
          onChange={handleBarangayChange}
          value={selectedBarangay}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a Barangay</option>
          {barangays.map((barangay) => (
            <option key={barangay._id} value={barangay.barangay_name}>
              {barangay.barangay_name}
            </option>
          ))}
        </select>
      </div>

      {/* King selection dropdown */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Select King</h2>
        <select
          onChange={handlePersonChange}
          value={selectedPerson}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={!selectedBarangay || barangayWithKing?.king} // Disable if barangay already has a king
        >
          <option value="">Choose a King</option>
          {filteredPeople.map((person) => (
            <option key={person._id} value={person._id}>
              {person.name}
            </option>
          ))}
        </select>
      </div>

      {/* Display king's name and button to add king */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          value={kingName}
          readOnly
          placeholder="King Name"
          className="flex-1 p-2 border rounded-lg bg-gray-100 text-gray-700 outline-none"
        />
        <button
          onClick={handleAddKing}
          className={`px-4 py-2 font-semibold rounded-lg ${
            barangayWithKing?.king || !king
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-red-500 text-white"
          }`}
          disabled={barangayWithKing?.king || !king} // Disable if no king selected or already exists
        >
          Add
        </button>
      </div>
    </div>
  );
}
