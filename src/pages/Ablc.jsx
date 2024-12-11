import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

export default function AngatKa() {
  const location = useLocation();
  const navigate = useNavigate();
  const barangayName = location.state?.barangayName || "No barangay selected";
  const kingName = location.state?.kingName || "No king assigned";
  const princes = location.state?.princes || []; // Retrieve the princes array
  const princeGeneral = location.state?.princeGeneral || []; // Retrieve the princeGeneral array

  const itemsPerPage = 10; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [loading, setLoading] = useState(false); // Loading state for fetch calls
  const [selectedPrinceId, setSelectedPrinceId] = useState(null); // New state for prince ID
  const [selectedBarangay, setSelectedBarangay] = useState(null); // New state for barangay name

  // Filter princes based on search term
  const filteredPrinces = princes.filter((prince) =>
    prince.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total pages for filtered princes
  const totalPages = Math.ceil(filteredPrinces.length / itemsPerPage);

  // Get current page's princes
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPrinces = filteredPrinces.slice(
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

  // Match the prince with its respective general count
  const getGeneralCount = (princeName) => {
    const prince = princeGeneral.find((pg) => pg.princeName === princeName);
    return prince ? prince.generalsCount : 0;
  };

  const handlePrinceClick = async (prince_id, barangay, princeName) => {
    setSelectedPrinceId(prince_id);
    setSelectedBarangay(barangay);
    setLoading(true);

    try {
      // Fetch the people data to filter generals based on the barangay and role
      const response = await axios.get("http://localhost:3001/people/by-barangay", {
        params: { barangay: barangayName },
      }); 
      const people = response.data;

      // Filter the generals based on barangay name and role ("general")
      const generalDetails = people
        .filter(
          (person) =>
            person.barangay_name?.toLowerCase() === barangay.toLowerCase() &&
            person.role === "general"
        )
        .map((general) => ({
          name: general.name,
          number: general.number,
          precinct: general.precinct,
          general_id: general._id, // ID of general in the people collection
        }));

      // Fetch the general data based on prince_id
      const generalResponse = await axios.get(
        "http://localhost:3001/general/",
        {
          params: { prince_id: prince_id },
        }
      );
      const generalData = generalResponse.data;

      // Filter generals by the selected prince_id and map them with their details
      const mappedGenerals = generalData
        .filter((general) => general.prince_id === prince_id)
        .map((general) => {
          const matchingGeneral = generalDetails.find(
            (person) => person.general_id === general.general_id
          );

          // Return the merged data with general details from the people collection
          return {
            general_id: general.general_id,
            general_name: general.general_name,
            number: matchingGeneral?.number || "-",
            precinct: matchingGeneral?.precinct || "-",
          };
        });

      // Navigate and pass the generals with the details
      navigate(`/get-names/${barangay}/ablc/${prince_id}`, {
        state: {
          barangayName: barangay,
          princeName: princeName,
          generals: mappedGenerals, // Pass the generals with the merged details
          kingName: kingName, 
        },
      });
    } catch (error) {
      console.error("Error fetching generals:", error);
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
        <span className="font-bold uppercase">ABLC List</span>
        <span className="font-bold uppercase text-red-500">
          ANGAT CHAIR: {kingName}
        </span>
        <input
          className="p-2 border border-red-500 rounded text-sm outline-none"
          type="text"
          placeholder="Enter Name"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 p-2">#</th>
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Phone No.</th>
              <th className="border border-gray-300 p-2">Precinct</th>
              <th className="border border-gray-300 p-2">No. of APC</th>
              <th className="border border-gray-300 p-2">No. of FL</th>
              <th className="border border-gray-300 p-2">Total DL</th>
              <th className="border border-gray-300 p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentPrinces.length > 0 ? (
              currentPrinces.map((prince, index) => (
                <tr key={index} className="even:bg-gray-50">
                  <td className="border border-gray-300 p-2">
                    {startIndex + index + 1}
                  </td>
                  <td
                    className="border border-gray-300 p-2 cursor-pointer"
                    onClick={() =>
                      handlePrinceClick(
                        prince.prince_id,
                        barangayName,
                        prince.name
                      )
                    }
                  >
                    {prince.name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {prince.number}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {prince.precinct}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {getGeneralCount(prince.name)}
                  </td>
                  {/* No. of APC*/}
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
                  No princes found.
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
