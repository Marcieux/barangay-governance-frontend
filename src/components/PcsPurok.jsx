import React, { useState, useContext } from "react";
import axios from "axios";
import PurokSearchBox from "./PurokSearchBox";
import BarangayContext from "../contexts/BarangayContext";

export default function PcsPurok({ personId }) {
  const { selectedBarangay } = useContext(BarangayContext);
  const [selectedPurok, setSelectedPurok] = useState("");

  const handleAddPurok = async () => {
    if (!selectedPurok) {
      alert("Please enter a valid Purok before proceeding.");
      return;
    }

    if (!window.confirm("Are you sure you want to add this Purok?")) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      // Fetch the pcs data for validation
      const pcsResponse = await axios.get(
        `http://localhost:3001/general/${personId}`
      );

      if (!pcsResponse.data.success) {
        const { message } = pcsResponse.data.error;
        alert(message); // Display backend's validation error
        return;
      }

      const pcsData = pcsResponse.data;

      // Fetch the person's data
      const personResponse = await axios.get(
        `http://localhost:3001/people/${personId}`
      );

      const personData = personResponse.data;

      // Check if the Purok is already assigned
      if (personData.purok?.trim() || pcsData.purok?.trim()) {
        alert("This PCS already has a Purok assigned.");
        return;
      }

      // Proceed with updates
      const personUpdate = axios.put(
        `http://localhost:3001/people/${personId}`,
        { purok: selectedPurok }
      );

      const pcsUpdate = axios.put(
        `http://localhost:3001/general/${personId}`,
        { purok: selectedPurok }
      );

      // Wait for both updates to complete
      await Promise.all([personUpdate, pcsUpdate]);

      alert("Purok added successfully!");
      setSelectedPurok(""); // Reset the input field
    } catch (err) {
      console.error("Error adding Purok:", err);
      alert(
        err.response?.data?.error?.message ||
          "An unexpected error occurred while adding the PCS's Purok."
      );
    }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        PCS's Purok
      </label>
      <div className="flex justify-between">
        <PurokSearchBox
          purokList={selectedBarangay?.purok_list || []}
          setSelectedPurok={setSelectedPurok}
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
