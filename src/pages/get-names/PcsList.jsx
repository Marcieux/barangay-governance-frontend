import React, { useState, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import BarangayContext from "../../contexts/BarangayContext";
export default function PcsList() {
  const { selectedBarangay } = useContext(BarangayContext);

  const location = useLocation();
  const navigate = useNavigate();
  const barangayName = location.state?.barangayName || "No Barangay Selected";
  const acName = location.state?.acName || "No Angat Chair Assigned";
  const pcs = location.state?.pcs || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [selectedPcsId, setSelectedPcsId] = useState(null);

  const filteredPcs = pcs.filter((pcs) =>
    pcs.purok
      ? pcs.purok.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  const totalPages = Math.ceil(filteredPcs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPcs = filteredPcs.slice(
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

  const handlePcsClick = async (general_id, barangay) => {
    setSelectedPcsId(general_id);
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/people/by-barangay`,
        {
          params: { barangay: selectedBarangay._id },
        }
      );
      const people = response.data;

      // Filter the pcl based on barangay name and role
      const pclDetails = people
        .filter(
          (person) =>
            person.barangay_id === selectedBarangay._id &&
            person.role === "pcl"
        )
        .map((pcl) => ({
          name: pcl.name,
          number: pcl.number,
          precinct: pcl.precinct,
          leader_id: pcl._id, // ID of leader in the people collection
        }));

      // Fetch the pcl data based on general
      const pclResponse = await axios.get(`${process.env.REACT_APP_API_URL}/leader/`, {
        params: { general_id: general_id },
      });

      const pclData = pclResponse.data.data;

      // Filter pcl by the selected general_id and map them with their details
      const mappedPcl = pclData
        .filter((pcl) => pcl.general_id === general_id)
        .map((pcl) => {
          const matchingPcl = pclDetails.find(
            (person) => person.leader_id === pcl.leader_id
          );

          // Return the merged data with pcl details from the people collection
          return {
            leader_id: pcl.leader_id,
            leader_name: pcl.leader_name,
            number: matchingPcl?.number || "-",
            precinct: matchingPcl?.precinct || "-",
            purok: pcl.purok || "-",
            member: pcl.member || [],
            fmCount: (pcl.member || []).length
          };
        });

      // Find the selected pcs details (from the pcs array in the location state)
      const selectedPcs = pcs.find(
        (pcs) => pcs.general_id === general_id
      );
      
      // Navigate and pass the pcl with the details
      navigate(`/get-names/${barangay}/pcs/${general_id}`, {
        state: {
          barangayName: barangay,
          pcl: mappedPcl, // Pass the pcl with the merged details
          pcs: selectedPcs,
        },
      });
    } catch (error) {
      console.error("Error fetching PCL:", error);
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
        <span className="font-bold uppercase">PCS List</span>
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
              <th className="border border-gray-300 p-2">BCO</th>
              <th className="border border-gray-300 p-2">Precinct</th>
              <th className="border border-gray-300 p-2">No. of PCL</th>
              <th className="border border-gray-300 p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentPcs.map((pcs, index) => (
              <tr key={index} className="even:bg-gray-50">
                <td className="border p-2">{startIndex + index + 1}</td>
                <td
                  className="border p-2 cursor-pointer"
                  onClick={() =>
                    handlePcsClick(pcs.general_id, barangayName)
                  }
                >
                  {pcs.general_name}
                </td>
                <td className="border p-2">{pcs.purok}</td>
                <td className="border p-2">{pcs.prince_name}</td>
                <td className="border p-2">{pcs.precinct}</td>
                <td className="border p-2">{pcs.pclCount}</td>
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
