import React, { useState } from "react";
import axios from "axios";

export default function AngatChairNumber({ personId, onSuccess }) {
  const [acNumber, setAcNumber] = useState("");

  const handleAcNumberChange = (e) => {
    const value = e.target.value;
    if (value.length <= 11 && /^\d*$/.test(value)) {
      setAcNumber(value);
    }
  };

  const handleAddNumber = async () => {
    if (acNumber.length === 11) {
      if (window.confirm("Are you sure you want to add this number?")) {
        try {
          await axios.put(`http://localhost:3001/people/${personId}`, {
            number: acNumber,
          });
          alert("Angat Chair's number added successfully!");
          setAcNumber(""); // Clear input after success
          onSuccess();
        } catch (err) {
          console.error("Error adding number:", err);
          alert("An error occurred while adding the Angat Chair's number.");
        }
      }
    } else {
      alert("Please enter an 11-digit phone number.");
    }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        Angat Chair's Number
      </label>
      <div className="flex justify-between">
        <input
          type="text"
          value={acNumber}
          onChange={handleAcNumberChange}
          placeholder="Enter 11-digit number"
          maxLength="11"
          className="p-2 border border-red-500 rounded outline-none text-sm"
        />
        <button
          onClick={handleAddNumber}
          disabled={!personId}
          className={`px-4 py-2 rounded font-semibold text-sm ${
            !personId
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "text-red-500"
          }`}
        >
          Add Number
        </button>
      </div>
    </div>
  );
}
