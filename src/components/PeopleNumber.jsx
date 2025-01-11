import React from "react";
export default function PeopleNumber({ personId, personNumber, setPersonNumber }) {

  const handleNumberChange = (e) => {
    const value = e.target.value;
    if (value.length <= 11 && /^\d*$/.test(value)) {
      setPersonNumber(value);
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <input
          type="text"
          value={personNumber}
          onChange={handleNumberChange}
          placeholder="Enter 11-digit number"
          maxLength="11"
          className="w-full p-2 border border-red-500 rounded outline-none text-sm"
        />
      </div>
    </div>
  );
}
