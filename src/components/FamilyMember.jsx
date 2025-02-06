import React from "react";
import FamilyMemberPurok from "./FamilyMemberPurok";
import FamilyMemberSearchBox from "./FamilyMemberSearchBox";

export default function FamilyMember(props) {
  const {
    searchText,
    suggestions,
    handleSearchChange,
    handlePersonSelect,
    handleAddFm,
    personId,
  } = props;

  return (
    <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
      <FamilyMemberSearchBox 
        searchText={searchText}
        suggestions={suggestions}
        handleSearchChange={handleSearchChange}
        handlePersonSelect={handlePersonSelect}
        handleAddFm={handleAddFm}
      />
      <FamilyMemberPurok personId={personId}/>
    </div>
  );
}
