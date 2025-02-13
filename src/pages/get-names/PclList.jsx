import React, { useState, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import BarangayContext from "../../contexts/BarangayContext";

export default function PclList() {
  const { selectedBarangay } = useContext(BarangayContext);

  const location = useLocation();
  const navigate = useNavigate();
  const barangayName = location.state?.barangayName || "No Barangay Selected";
  const acName = location.state?.acName || "No Angat Chair assigned";
  const pcl = location.state?.pcl || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(false);
  const [selectedPclId, setSelectedPclId] = useState(null);

  const filteredPcl = pcl.filter((pcl) =>
    pcl.purok
      ? pcl.purok.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  const totalPages = Math.ceil(filteredPcl.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPcl = filteredPcl.slice(
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

  const handlePclClick = async (leader_id, barangay) => {
    setSelectedPclId(leader_id);
    setLoading(true);

    try {
      const response = await axios.get(
        "http://localhost:3001/people/by-barangay",
        {
          params: { barangay: selectedBarangay._id },
        }
      );
      const people = response.data;

      // Filter the fm based on barangay name and role
      const fmDetails = people
        .filter(
          (person) =>
            person.barangay_id === selectedBarangay._id &&
            person.role === "fm"
        )
        .map((fm) => ({
          name: fm.name,
          number: fm.number,
          precinct: fm.precinct,
          member_id: fm._id, // ID of member in the people collection
        }));

      // Fetch the fm data based on leader
      const fmResponse = await axios.get("http://localhost:3001/member/", {
        params: { leader_id: leader_id },
      });

      const fmData = fmResponse.data.data;

      // Filter fm by the selected leader_id and map them with their details
      const mappedFm = fmData
        .filter((fm) => fm.leader_id === leader_id)
        .map((fm) => {
          const matchingFm = fmDetails.find(
            (person) => person.member_id === fm.member_id
          );

          // Return the merged data with fm details from the people collection
          return {
            member_id: fm.member_id,
            member_name: fm.member_name,
            number: matchingFm?.number || "-",
            precinct: matchingFm?.precinct || "-",
            purok: fm.purok || "-",
          };
        });

      // Find the selected pcl details (from the pcl array in the location state)
      const selectedPcl = pcl.find(
        (pcl) => pcl.leader_id === leader_id
      );
      
      // Navigate and pass the fm with the details
      navigate(`/get-names/${barangay}/pcl/${leader_id}`, {
        state: {
          barangayName: barangay,
          fm: mappedFm, // Pass the fm with the merged details
          pcl: selectedPcl,
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
        <span className="font-bold uppercase">PCL List</span>
        <span className="font-bold uppercase text-red-500">
          ANGAT CHAIR: {acName}
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
              <th className="border border-gray-300 p-2">PCS</th>
              <th className="border border-gray-300 p-2">Precinct</th>
              <th className="border border-gray-300 p-2">No. of FM</th>
              <th className="border border-gray-300 p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentPcl.map((leader, index) => (
              <tr key={index} className="even:bg-gray-50">
                <td className="border p-2">{startIndex + index + 1}</td>
                <td
                  className="border p-2 cursor-pointer"
                  onClick={() =>
                    handlePclClick(leader.leader_id, barangayName)
                  }
                >
                  {leader.leader_name}
                </td>
                <td className="border p-2">{leader.purok}</td>
                <td className="border p-2">{leader.general_name}</td>
                <td className="border p-2">{leader.precinct}</td>
                <td className="border p-2">{leader.fmCount}</td>
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
