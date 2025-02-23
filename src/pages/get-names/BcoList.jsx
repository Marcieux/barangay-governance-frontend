import React, { useState, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import BarangayContext from "../../contexts/BarangayContext";
export default function BcoList() {
  const { selectedBarangay } = useContext(BarangayContext);

  const location = useLocation();
  const navigate = useNavigate();
  const barangayName = location.state?.barangayName || "No Barangay Selected";
  const acName = location.state?.acName || "No Angat Chair assigned";
  const bcos = location.state?.bcos || []; // Retrieve the bcos array
  const bcoPcs = location.state?.bcoPcs || []; // Retrieve the bcoPcs array

  const itemsPerPage = 10; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [loading, setLoading] = useState(false); // Loading state for fetch calls
  const [selectedBcoId, setSelectedBcoId] = useState(null); // New state for prince ID

  // Filter bcos based on search term
  const filteredBco = bcos.filter((bco) =>
    bco.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total pages for filtered bcos
  const totalPages = Math.ceil(filteredBco.length / itemsPerPage);

  // Get current page's bcos
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBco = filteredBco.slice(
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

  // Match the prince with its respective pcs count
  const getPcsCount = (bcoName) => {
    const bco = bcoPcs.find((pg) => pg.bcoName === bcoName);
    return bco ? bco.pcsCount : 0;
  };

  const handleBcoClick = async (prince_id, barangay, bcoName) => {
    setSelectedBcoId(prince_id);
    setLoading(true);
    try {
      // Fetch the people data to filter pcs based on the barangay and role
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/people/by-barangay`,
        {
          params: { barangay: selectedBarangay._id },
        }
      );
      const people = response.data;

      // Filter the pcs based on barangay name and role
      const pcsDetails = people
        .filter(
          (person) =>
            person.barangay_id === selectedBarangay._id &&
            person.role === "pcs"
        )
        .map((pcs) => ({
          name: pcs.name,
          number: pcs.number,
          precinct: pcs.precinct,
          general_id: pcs._id, // ID of pcs in the people collection
        }));

      // Fetch the pcs data based on prince_id
      const pcsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/general/`,
        {
          params: { prince_id: prince_id },
        }
      );
      const pcsData = pcsResponse.data;

      // Filter pcs by the selected prince_id and map them with their details
      const mappedPcs = pcsData
        .filter((pcs) => pcs.prince_id === prince_id)
        .map((pcs) => {
          const matchingPcs = pcsDetails.find(
            (person) => person.general_id === pcs.general_id
          );

          // Return the merged data with pcs details from the people collection
          return {
            general_id: pcs.general_id,
            general_name: pcs.general_name,
            number: matchingPcs?.number || "-",
            precinct: matchingPcs?.precinct || "-",
            purok: pcs.purok || "-",
          };
        });

      // Navigate and pass the pcs with the details
      navigate(`/get-names/${barangay}/bco/${prince_id}`, {
        state: {
          barangayName: barangay,
          bcoName: bcoName,
          pcs: mappedPcs, // Pass the pcs with the merged details
          acName: acName, 
        },
      });
    } catch (error) {
      console.error("Error fetching PCS:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner if fetching data
  if (loading) {
    return <Loading message="Please wait..." />;
  }

  return (
    <div className="inline-block bg-white p-6 rounded shadow-md w-[900px] h-[680px] space-y-8">
      <h1 className="text-3xl text-center font-bold uppercase text-gray-800">
        {barangayName}
      </h1>

      <div className="flex flex-row justify-between items-center text-sm">
        <span className="font-bold uppercase">BCO List</span>
        <span className="font-bold uppercase text-red-500">
          ANGAT CHAIR: {acName}
        </span>
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
              <th className="border border-gray-300 p-2">No. of PCS</th>
              <th className="border border-gray-300 p-2">No. of PCL</th>
              <th className="border border-gray-300 p-2">Total DL</th>
              <th className="border border-gray-300 p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentBco.length > 0 ? (
              currentBco.map((bco, index) => (
                <tr key={index} className="even:bg-gray-50">
                  <td className="border border-gray-300 p-2">
                    {startIndex + index + 1}
                  </td>
                  <td
                    className="border border-gray-300 p-2 cursor-pointer"
                    onClick={() =>
                      handleBcoClick(
                        bco.prince_id,
                        selectedBarangay.barangay_name,
                        bco.name
                      )
                    }
                  >
                    {bco.name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {bco.number}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {bco.precinct}
                  </td>
                  <td className="border border-gray-300 p-2">{bco.purok}</td>
                  <td className="border border-gray-300 p-2">
                    {getPcsCount(bco.name)}
                  </td>
                  {/* No. of PCS*/}
                  <td className="border border-gray-300 p-2">-</td>
                  <td className="border border-gray-300 p-2">-</td>
                  <td className="border border-gray-300 p-2">-</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="border border-gray-300 p-4 text-center text-gray-500"
                >
                  No BCO found.
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
