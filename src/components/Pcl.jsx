import React from "react";
import PclPurok from "./PclPurok";
import PclSearchBox from "./PclSearchBox";

export default function Pcl(props) {
  const {
    searchText,
    suggestions,
    handleSearchChange,
    handlePersonSelect,
    handleAddPcl,
    personId,
  } = props;
  return (
    <div className="bg-white p-6 rounded shadow-md w-[400px] mt-4 space-y-4">
      <PclSearchBox
        searchText={searchText}
        suggestions={suggestions}
        handleSearchChange={handleSearchChange}
        handlePersonSelect={handlePersonSelect}
        handleAddPcl={handleAddPcl}

      />
      <PclPurok personId={personId}/>
    </div>
  );
}
