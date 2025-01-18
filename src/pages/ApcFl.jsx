import React, { useState } from "react";
import { useLocation } from "react-router-dom";

export default function ApcFl() {
  const location = useLocation();
  const barangayName = location.state?.barangayName || "No barangay selected";
  const leaders = location.state?.leaders || [];
  const generals = location.state?.generals || [];
  
  //Extracting selected general details
  const apc = generals.general_name || "No APC (General) assigned";
  const ablc = generals.prince_name || "No ABLC (Prince) assigned";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter leaders based on search term
  const filteredLeaders = leaders.filter((leader) =>
    leader.leader_name
      ? leader.leader_name.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  // Calculate total pages for filtered generals
  const totalPages = Math.ceil(filteredLeaders.length / itemsPerPage);

  // Get current page's generals
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeaders = filteredLeaders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle page change
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
    setCurrentPage(1); // Reset to the first page on search
  };

  return (
    <div className="inline-block bg-white p-6 rounded shadow-md w-[900px] h-[680px] space-y-8">
      <h1 className="text-3xl text-center font-bold uppercase text-gray-800">
        {barangayName}
      </h1>

      <div className="flex flex-row justify-between items-center text-sm">
        <span className="font-bold uppercase">FL List</span>
        <span className="font-bold uppercase text-red-500">APC: {apc}</span>

        <span className="font-bold uppercase text-red-500">ABLC: {ablc}</span>
        <input
          className="p-2 border border-red-500 rounded text-sm outline-none"
          type="text"
          placeholder="Enter Name"
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
              <th className="border border-gray-300 p-2">Phone No.</th>
              <th className="border border-gray-300 p-2">Precinct</th>
              <th className="border border-gray-300 p-2">Purok</th>
              <th className="border border-gray-300 p-2">No. of FM</th>
              <th className="border border-gray-300 p-2">Total DL</th>
              <th className="border border-gray-300 p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentLeaders.length > 0 ? (
              currentLeaders.map((leader, index) => (
                <tr key={index} className="even:bg-gray-50">
                  <td className="border border-gray-300 p-2">
                    {startIndex + index + 1}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {leader.leader_name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {leader.number}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {leader.precinct}
                  </td>
                  <td className="border border-gray-300 p-2">{leader.purok}</td>
                  <td className="border border-gray-300 p-2">-</td>
                  <td className="border border-gray-300 p-2">-</td>
                  <td className="border border-gray-300 p-2">-</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="border border-gray-300 p-4 text-center text-gray-500"
                >
                  No leaders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex text-sm justify-between items-center">
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
