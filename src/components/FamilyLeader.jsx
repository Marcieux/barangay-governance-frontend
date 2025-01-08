import React from "react";
import FamilyLeaderPurok from "./FamilyLeaderPurok";
import FamilyLeaderSearchBox from "./FamilyLeaderSearchBox";

export default function FamilyLeader(props) {
  const {
    searchText,
    suggestions,
    handleSearchChange,
    handlePersonSelect,
    handleAddFl,
    personId,
  } = props;
  return (
    <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
      <FamilyLeaderSearchBox
        searchText={searchText}
        suggestions={suggestions}
        handleSearchChange={handleSearchChange}
        handlePersonSelect={handlePersonSelect}
        handleAddFl={handleAddFl}

      />
      <FamilyLeaderPurok personId={personId}/>
    </div>
  );
}
