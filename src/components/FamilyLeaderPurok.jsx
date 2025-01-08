import React, { useState } from "react";
import axios from "axios";

export default function FamilyLeaderPurok({ personId }) {
  const [flPurok, setFlPurok] = useState("");

  const handleFlPurokChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFlPurok(value);
  };

  const handleAddPurok = async () => {
    if (!flPurok) {
      alert("Please enter a valid Purok before proceeding.");
      return;
    }

    if (!window.confirm("Are you sure you want to add this Purok?")) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      // Fetch the leader data for validation
      const leaderResponse = await axios.get(
        `http://localhost:3001/leader/${personId}`
      );

      if (!leaderResponse.data.success) {
        const { message } = leaderResponse.data.error;
        alert(message); // Display backend's validation error
        return;
      }

      const flData = leaderResponse.data.data;

      // Fetch the person's data
      const personResponse = await axios.get(
        `http://localhost:3001/people/${personId}`
      );

      const personData = personResponse.data;

      // Check if the Purok is already assigned
      if (personData.purok?.trim() || flData.purok?.trim()) {
        alert("This FL already has a Purok assigned.");
        return;
      }

      // Proceed with updates
      const personUpdate = axios.put(
        `http://localhost:3001/people/${personId}`,
        { purok: flPurok }
      );

      const leaderUpdate = axios.put(
        `http://localhost:3001/leader/${personId}`,
        { purok: flPurok }
      );

      // Wait for both updates to complete
      await Promise.all([personUpdate, leaderUpdate]);

      alert("Purok added successfully!");
      setFlPurok(""); // Reset the input field
    } catch (err) {
      console.error("Error adding Purok:", err);
      alert(
        err.response?.data?.error?.message ||
          "An unexpected error occurred while adding the FL's Purok."
      );
    }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        FL's Purok
      </label>

      <div className="flex justify-between">
        <input
          type="text"
          placeholder="Enter Purok..."
          value={flPurok}
          onChange={handleFlPurokChange}
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
