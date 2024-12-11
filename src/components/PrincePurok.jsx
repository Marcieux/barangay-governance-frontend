import React, { useState } from "react";
import axios from "axios";

export default function PrincePurok({ personId, onSuccess }) {
  const [princePurok, setPrincePurok] = useState("");

  const handlePrincePurokChange = (e) => {
    const value = e.target.value;
    setPrincePurok(value);
  };

  const handleAddPurok = async () => {
    if (princePurok)
      if (window.confirm("Are you sure you want to add this Purok?")) {
        try {
          await axios.put(`http://localhost:3001/people/${personId}`, {
            purok: princePurok,
          });
          alert("Prince's Purok added successfully!");
          setPrincePurok("");
          onSuccess();
        } catch (err) {
          console.error("Error adding Purok:", err);
          alert("An error occurred while adding the prince's Purok.");
        }
      } else {
        alert("Please enter Purok.");
      }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        Prince's Purok
      </label>
      <div className="flex justify-between">
        <input
          type="text"
          value={princePurok}
          onChange={handlePrincePurokChange}
          placeholder="Enter Purok..."
          className="p-2 border border-red-500 rounded outline-none text-sm"
        />
        <button
          onClick={handleAddPurok}
          disabled={!personId}
          className={`px-4 py-2 rounded font-semibold text-sm ${
            !personId
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "text-red-500"
          }`}
        >
          Add Purok
        </button>
      </div>
    </div>
  );
}
