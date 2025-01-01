import React, { useState } from "react";
import axios from "axios";

export default function GeneralPurok({ personId, onSuccess }) {
  const [generalPurok, setGeneralPurok] = useState("");

  const handleGeneralPurokChange = (e) => {
    const value = e.target.value.toUpperCase();
    setGeneralPurok(value);
  };
  
  const handleAddPurok = async () => {
    if (generalPurok)
      if (window.confirm("Are you sure you want to add this Purok?")) {
        try {
          // Fetch current data of the person to check if Purok is already assigned
          const response = await axios.get(
            `http://localhost:3001/people/${personId}`
          );
          const personData = response.data;

          // Check if Purok is already assigned in the people collection
          if (personData.purok?.trim()) {
            alert("This APC already has a Purok assigned.");
            return;
          }

          // Proceed with the update if Purok is not already assigned
          await axios.put(`http://localhost:3001/people/${personId}`, {
            purok: generalPurok,
          });
          setGeneralPurok("");
          onSuccess(generalPurok);
        } catch (err) {
          console.error("Error adding Purok:", err);
          alert("An error occurred while adding the APC's Purok.");
        }
      }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        APC's Purok
      </label>
      <div className="flex justify-between">
        <input
          type="text"
          value={generalPurok}
          onChange={handleGeneralPurokChange}
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
  )
}
