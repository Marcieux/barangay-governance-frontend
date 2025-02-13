import React from "react";

export default function AngatChairSearchBox(props) {
  const {
    barangayWithAc,
    searchText,
    handleSearchChange,
    suggestions,
    handlePersonSelect,
    acId,
    handleAddAc,
    isAcAdded,
    acName
  } = props;

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        Angat Chair
      </label>
      <div className="flex gap-5">
        {barangayWithAc?.king_id || isAcAdded ? (
          <input
            type="text"
            value={barangayWithAc?.king_name || acName}
            readOnly
            className="w-full p-2 border border-red-500 rounded bg-gray-100 text-gray-700 outline-none text-sm"
          />
        ) : (
          <input
            type="text"
            onChange={handleSearchChange}
            value={searchText}
            placeholder="Search Angat Chair "
            className="w-full p-2 border border-red-500 rounded outline-none text-sm"
          />
        )}

        <button
          onClick={handleAddAc}
          className={`px-4 py-2 font-semibold rounded text-sm ${
            barangayWithAc?.king_id || !acId
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "text-red-500"
          }`}
          disabled={barangayWithAc?.king_id || !acId}
        >
          Add
        </button>
      </div>
      {suggestions.length > 0 && !barangayWithAc?.king_id && (
        <ul className="border border-gray-200 max-h-40 overflow-y-auto absolute bg-white w-[350px] z-10 mt-1">
          {suggestions.map((person) => (
            <li
              key={person._id}
              onClick={() => handlePersonSelect(person)}
              className="p-2 cursor-pointer text-sm hover:bg-gray-100"
            >
              {person.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
