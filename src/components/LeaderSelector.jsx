import React from "react";

export default function LeaderSelector(props) {
  const { searchText, suggestions, handleSearchChange, handlePersonSelect } =
    props;

  return (
    <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
      <label className="block mb-2 text-sm font-medium text-red-500">FL</label>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-5">
          <input
            placeholder="Search FL"
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
