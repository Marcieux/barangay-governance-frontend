import React from "react";

export default function PrinceSearchBox(props) {
  const {
    searchText,
    handleSearchChange,
    suggestions,
    handlePersonSelect,
    handleAddPrince
  } = props;
  
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        Prince
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-5">
          <input
            placeholder="Search Prince"
            className="w-full p-2 border border-red-500 rounded outline-none text-sm"
            type="text"
            value={searchText}
            onChange={handleSearchChange}
          />
          <button
            className="px-4 py-2 font-semibold rounded text-sm text-red-500"
            onClick={handleAddPrince}
          >
            Add
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="border border-gray-200 max-h-40 overflow-y-auto absolute bg-white w-[350px] z-10 mt-10 text-sm">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion._id}
                className="p-1 cursor-pointer hover:bg-gray-200"
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
