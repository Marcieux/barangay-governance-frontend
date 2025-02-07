import React, { useState, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import BarangayContext from "../contexts/BarangayContext";

export default function Fl() {
  const { selectedBarangay } = useContext(BarangayContext);

  const location = useLocation();
  const navigate = useNavigate();
  const barangayName = location.state?.barangayName || "No barangay selected";
  const kingName = location.state?.kingName || "No king assigned";
  const leaders = location.state?.leaders || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState(null);

  const filteredLeaders = leaders.filter((leader) =>
    leader.purok
      ? leader.purok.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  const totalPages = Math.ceil(filteredLeaders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeaders = filteredLeaders.slice(
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

  const handleLeaderClick = async (leader_id, barangay) => {
    setSelectedLeaderId(leader_id);
    setLoading(true);

    try {
      const response = await axios.get(
        "http://localhost:3001/people/by-barangay",
        {
          params: { barangay: selectedBarangay._id },
        }
      );
      const people = response.data;

      // Filter the members based on barangay name and role
      const memberDetails = people
        .filter(
          (person) =>
            person.barangay_id === selectedBarangay._id &&
            person.role === "member"
        )
        .map((member) => ({
          name: member.name,
          number: member.number,
          precinct: member.precinct,
          member_id: member._id, // ID of member in the people collection
        }));

      // Fetch the member data based on leader
      const memberResponse = await axios.get("http://localhost:3001/member/", {
        params: { leader_id: leader_id },
      });

      const memberData = memberResponse.data.data;

      // Filter members by the selected leader_id and map them with their details
      const mappedMembers = memberData
        .filter((member) => member.leader_id === leader_id)
        .map((member) => {
          const matchingMember = memberDetails.find(
            (person) => person.member_id === member.member_id
          );

          // Return the merged data with member details from the people collection
          return {
            member_id: member.member_id,
            member_name: member.member_name,
            number: matchingMember?.number || "-",
            precinct: matchingMember?.precinct || "-",
            purok: member.purok || "-",
          };
        });

      // Find the selected leader's details (from the leaders array in the location state)
      const selectedLeader = leaders.find(
        (leader) => leader.leader_id === leader_id
      );
      
      // Navigate and pass the members with the details
      navigate(`/get-names/${barangay}/fl/${leader_id}`, {
        state: {
          barangayName: barangay,
          members: mappedMembers, // Pass the members with the merged details
          leaders: selectedLeader,
        },
      });
    } catch (error) {
      console.error("Error fetching FMs:", error);
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
        <span className="font-bold uppercase">FL List</span>
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
              <th className="border border-gray-300 p-2">APC</th>
              <th className="border border-gray-300 p-2">Precinct</th>
              <th className="border border-gray-300 p-2">No. of FM</th>
              <th className="border border-gray-300 p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentLeaders.map((leader, index) => (
              <tr key={index} className="even:bg-gray-50">
                <td className="border p-2">{startIndex + index + 1}</td>
                <td
                  className="border p-2 cursor-pointer"
                  onClick={() =>
                    handleLeaderClick(leader.leader_id, barangayName)
                  }
                >
                  {leader.leader_name}
                </td>
                <td className="border p-2">{leader.purok}</td>
                <td className="border p-2">{leader.general_name}</td>
                <td className="border p-2">{leader.precinct}</td>
                <td className="border p-2">{leader.memberCount}</td>
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
