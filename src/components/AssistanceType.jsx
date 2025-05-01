import React, { useState } from "react";

import axios from "axios";
export default function AssistanceType({ personId, personName }) {
  const [assistanceType, setAssistanceType] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddAssistance = async () => {
    if (!personId) {
      alert("Select a person first.");
      return;
    }

    if (!assistanceType) {
      alert("Please select an assistance type.");
      return;
    }

    if (!amount) {
      alert("Please enter an amount.");
      return;
    }

    if (window.confirm(`Are you sure you want to add ${assistanceType} assistance of ₱${amount} for ${personName}?`)) {
      try {
        await axios.post(
          "http://localhost:10000/api/assistance",
          {
            person_id: personId,
            person_name: personName,
            type: assistanceType,
            amount: amount,
          }
        );
  
        alert("Assistance added successfully!");
        setAssistanceType("");
        setAmount("");
      } catch (err) {
        console.error("Error adding Assistance:", err);
        alert("An error occurred while adding the Assistance.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-red-500">
        Assistance Type
      </label>
      <select
        className="w-full p-2 border border-red-500 rounded outline-none text-sm"
        value={assistanceType}
        onChange={(e) => setAssistanceType(e.target.value)}
      >
        <option value="" disabled>
          Choose an Assistance
        </option>
        <option value="medical">Medical</option>
        <option value="burial">Burial</option>
        <option value="aics">AICS</option>
      </select>
      <label className="block text-sm font-medium text-red-500">Amount</label>
      <input
        type="number"
        className="w-full p-2 border border-red-500 rounded outline-none text-sm"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        className="px-4 py-2 font-semibold rounded text-sm bg-red-500 text-white"
        onClick={handleAddAssistance}
      >
        Add Assistance
      </button>
    </div>
  );
}
