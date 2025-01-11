import React from "react";

export default function ReferredBySearchBox(props) {
  const {
    searchText,
    handleSearchChange,
    suggestions,
    handlePersonSelect
  } = props;

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        Referred By
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-5">
          <input
            placeholder="Search Referral"
            className="w-full p-2 border border-red-500 rounded outline-none text-sm"
            type="text"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
        {suggestions.length > 0 && (
          <ul className="border border-gray-200 max-h-40 overflow-y-auto absolute bg-white w-[350px] z-10 mt-10 text-sm">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion._id}
                className="p-2 cursor-pointer text-sm hover:bg-gray-100"
                onClick={() => handlePersonSelect(suggestion)}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
