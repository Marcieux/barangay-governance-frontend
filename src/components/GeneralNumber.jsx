import React, { useState } from "react";
import axios from "axios";

export default function GeneralNumber({ personId, onSuccess }) {
  const [generalNumber, setGeneralNumber] = useState("");

  const handleGeneralNumberChange = (e) => {
    const value = e.target.value;
    if (value.length <= 11 && /^\d*$/.test(value)) {
      setGeneralNumber(e.target.value);
    }
  };
  
  const handleAddNumber = async () => {
    if (generalNumber.length === 11)
      if (window.confirm("Are you sure you want to add this number?")) {
        try {
          await axios.put(`http://localhost:3001/people/${personId}`, {
            number: generalNumber,
          });
          alert("General's number added successfully!");
          setGeneralNumber("");
          onSuccess();
        } catch (err) {
          console.error("Error adding number:", err);
          alert("An error occurred while adding the general's number.");
        }
      } else {
        alert("Please enter an 11-digit number.");
      }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        General's Number
      </label>
      <div className="flex justify-between">
        <input
          type="text"
          value={generalNumber}
          onChange={handleGeneralNumberChange}
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
  )
}
