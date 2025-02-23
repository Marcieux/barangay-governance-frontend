import React, { useState } from "react";
import axios from "axios";

export default function ReferralNumber({ personId }) {
  const [referralNumber, setReferralNumber] = useState("");

  const handleNumberChange = (e) => {
    const value = e.target.value;
    if (value.length <= 11 && /^\d*$/.test(value)) {
      setReferralNumber(value);
    }
  };

  const handleAddNumber = async () => {
    if (referralNumber.length === 11) {
      if (window.confirm("Are you sure you want to add this number?")) {
        try {
          await axios.put(`${process.env.REACT_APP_API_URL}/people/${personId}`, {
            number: referralNumber,
          });
          alert("Referral's number added successfully!");
          setReferralNumber("");
        } catch (err) {
          console.error("Error adding number:", err);
          alert("An error occurred while adding the referral's number.");
        }
      }
    } else {
      alert("Please enter an 11-digit phone number.");
    }
  };

  return(
    <div>
      <div className="flex justify-between">
        <input
          type="text"
          value={referralNumber}
          onChange={handleNumberChange}
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
