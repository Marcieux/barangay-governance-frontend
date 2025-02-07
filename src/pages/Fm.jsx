import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Loading from "../components/Loading";

export default function Fm() {
  const location = useLocation();
  const barangayName = location.state?.barangayName || "No barangay selected";
  const kingName = location.state?.kingName || "No king assigned";
  const members = location.state?.members || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(false);

  const filteredMembers = members.filter((member) =>
    member.purok
      ? member.purok.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMembers = filteredMembers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <Loading message="Please wait..." />;
  }

  return (
    <div className="inline-block bg-white p-6 rounded shadow-md w-[900px] h-[680px] space-y-8">
      <h1 className="text-3xl text-center font-bold uppercase text-gray-800">
        {barangayName}
      </h1>

      <div className="flex flex-row justify-between items-center text-sm">
        <span className="font-bold uppercase">FM List</span>
        <span className="font-bold uppercase text-red-500">
          ANGAT CHAIR: {kingName}
        </span>
        <input
          className="p-2 border border-red-500 rounded text-sm outline-none"
          type="text"
          placeholder="Enter Purok"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="overflow-x-auto overflow-y-auto mt-4 max-h-[400px]">
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead className="sticky -top-1">
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 p-2">#</th>
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Purok</th>
              <th className="border border-gray-300 p-2">FL</th>
              <th className="border border-gray-300 p-2">Precinct</th>
              <th className="border border-gray-300 p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentMembers.map((member, index) => (
              <tr key={index} className="even:bg-gray-50">
                <td className="border p-2">{startIndex + index + 1}</td>
                <td className="border p-2">{member.member_name}</td>
                <td className="border p-2">{member.purok}</td>
                <td className="border p-2">{member.leader_name}</td>
                <td className="border p-2">{member.precinct}</td>
                <td className="border p-2">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex text-sm justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 border rounded ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-red-500 text-white"
          }`}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 border rounded ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-red-500 text-white"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
