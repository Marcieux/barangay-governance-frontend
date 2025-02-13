import React from "react";

export default function PclSearchBox(props) {
  const {
    searchText,
    suggestions,
    handleSearchChange,
    handlePersonSelect,
    handleAddPcl,
  } = props;
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">PCL</label>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-5">
          <input
            placeholder="Search PCL"
            className="w-full p-2 border border-red-500 rounded outline-none text-sm"
            type="text"
            value={searchText}
            onChange={handleSearchChange}
          />
          <button
            className="px-4 py-2 font-semibold rounded text-sm text-red-500"
            onClick={handleAddPcl}
          >
            Add
          </button>
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
    </div>
  );
}
