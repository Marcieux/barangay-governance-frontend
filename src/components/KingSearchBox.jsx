import React from "react";

export default function KingSearchBox(props) {
  const {
    barangayWithKing,
    searchText,
    handleSearchChange,
    suggestions,
    handlePersonSelect,
    king,
    handleAddKing,
    isKingAdded,
    kingName
  } = props;

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        King
      </label>
      <div className="flex gap-5">
        {barangayWithKing?.king_id || isKingAdded ? (
          <input
            type="text"
            value={barangayWithKing?.king_name || kingName}
            readOnly
            className="w-full p-2 border border-red-500 rounded bg-gray-100 text-gray-700 outline-none text-sm"
          />
        ) : (
          <input
            type="text"
            onChange={handleSearchChange}
            value={searchText}
            placeholder="Search King"
            className="w-full p-2 border border-red-500 rounded outline-none text-sm"
          />
        )}

        <button
          onClick={handleAddKing}
          className={`px-4 py-2 font-semibold rounded text-sm ${
            barangayWithKing?.king_id || !king
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "text-red-500"
          }`}
          disabled={barangayWithKing?.king_id || !king}
        >
          Add
        </button>
      </div>
      {/* Suggestions for king search */}
      {suggestions.length > 0 && !barangayWithKing?.king_id && (
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
