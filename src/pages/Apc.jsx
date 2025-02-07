import React, { useState, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import BarangayContext from "../contexts/BarangayContext";
export default function Apc() {
  const { selectedBarangay } = useContext(BarangayContext);

  const location = useLocation();
  const navigate = useNavigate();
  const barangayName = location.state?.barangayName || "No barangay selected";
  const kingName = location.state?.kingName || "No king assigned";
  const generals = location.state?.generals || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [selectedGeneralId, setSelectedGeneralId] = useState(null);

  const filteredGenerals = generals.filter((general) =>
    general.purok
      ? general.purok.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  const totalPages = Math.ceil(filteredGenerals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGenerals = filteredGenerals.slice(
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
    setCurrentPage(1); // Reset to the first page on search
  };

  const handleGeneralClick = async (general_id, barangay) => {
    setSelectedGeneralId(general_id);
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3001/people/by-barangay",
        {
          params: { barangay: selectedBarangay._id },
        }
      );
      const people = response.data;

      // Filter the leaders based on barangay name and role
      const leaderDetails = people
        .filter(
          (person) =>
            person.barangay_id === selectedBarangay._id &&
            person.role === "leader"
        )
        .map((leader) => ({
          name: leader.name,
          number: leader.number,
          precinct: leader.precinct,
          leader_id: leader._id, // ID of leader in the people collection
        }));

      // Fetch the leader data based on general
      const leaderResponse = await axios.get("http://localhost:3001/leader/", {
        params: { general_id: general_id },
      });

      const leaderData = leaderResponse.data.data;

      // Filter leaders by the selected general_id and map them with their details
      const mappedLeaders = leaderData
        .filter((leader) => leader.general_id === general_id)
        .map((leader) => {
          const matchingLeader = leaderDetails.find(
            (person) => person.leader_id === leader.leader_id
          );

          // Return the merged data with leader details from the people collection
          return {
            leader_id: leader.leader_id,
            leader_name: leader.leader_name,
            number: matchingLeader?.number || "-",
            precinct: matchingLeader?.precinct || "-",
            purok: leader.purok || "-",
            member: leader.member || [],
            memberCount: (leader.member || []).length
          };
        });

      // Find the selected general's details (from the generals array in the location state)
      const selectedGeneral = generals.find(
        (general) => general.general_id === general_id
      );
      
      // Navigate and pass the leaders with the details
      navigate(`/get-names/${barangay}/apc/${general_id}`, {
        state: {
          barangayName: barangay,
          leaders: mappedLeaders, // Pass the leaders with the merged details
          generals: selectedGeneral,
        },
      });
    } catch (error) {
      console.error("Error fetching FLs:", error);
    } finally {
      setLoading(false);
    }
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
        <span className="font-bold uppercase">APC List</span>
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
              <th className="border border-gray-300 p-2">ABLC</th>
              <th className="border border-gray-300 p-2">Precinct</th>
              <th className="border border-gray-300 p-2">No. of FL</th>
              <th className="border border-gray-300 p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentGenerals.map((general, index) => (
              <tr key={index} className="even:bg-gray-50">
                <td className="border p-2">{startIndex + index + 1}</td>
                <td
                  className="border p-2 cursor-pointer"
                  onClick={() =>
                    handleGeneralClick(general.general_id, barangayName)
                  }
                >
                  {general.general_name}
                </td>
                <td className="border p-2">{general.purok}</td>
                <td className="border p-2">{general.prince_name}</td>
                <td className="border p-2">{general.precinct}</td>
                <td className="border p-2">{general.leaderCount}</td>
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
