import React, { useContext, useState, useEffect, useCallback } from "react";
import BarangayDropdown from "../../components/BarangayDropdown";
import BarangayContext from "../../contexts/BarangayContext";
import { useFilteredPeople } from "../../hooks/useBarangayData";
import PeopleSearchBox from "../../components/PeopleSearchBox";
import axios from "axios";

export default function SearchPerson() {
  const { barangays, selectedBarangay, setSelectedBarangay } =
    useContext(BarangayContext);
  const filteredPeople = useFilteredPeople();

  // People Search
  const [peopleId, setPeopleId] = useState(null);
  const [peopleSearchText, setPeopleSearchText] = useState("");
  const [peopleSuggestions, setPeopleSuggestions] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");

  // State to store upline details
  const [upline, setUpline] = useState(false);
  const [downline, setDownline] = useState(false);
  const [uplineDetails, setUplineDetails] = useState([]);
  const [downlineDetails, setDownlineDetails] = useState([]);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    // Clear all relevant state
    setPeopleId(null);
    setPeopleSearchText("");
    setPeopleSuggestions([]);
    setSelectedPerson("");
    setUpline(false);
    setDownline(false);
    setUplineDetails([]);
    setDownlineDetails([]);
  };

  // Handle people search
  const handlePeopleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPeopleSearchText(value);

    if (!value || !selectedBarangay) {
      setPeopleSuggestions([]);
      setPeopleId(null);
      return;
    }

    const tokens = value.split(" ");
    const filteredSuggestions = filteredPeople
      .filter(
        (person) => person.barangay_id === selectedBarangay._id && person._id
      )
      .map((person) => ({
        person,
        score: tokens.reduce(
          (acc, token) =>
            acc + (person.name.toLowerCase().includes(token) ? 1 : 0),
          0
        ),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ person }) => person);

    setPeopleSuggestions(filteredSuggestions);
  };

  // Add role-to-label mapping
  const ROLE_LABELS = {
    angatchair: "Angat Chair",
    bco: "BCO",
    pcs: "PCS",
    pcl: "PCL",
  };

  const handlePeopleSelect = (person) => {
    setSelectedPerson({
      ...person,
      roleLabel: ROLE_LABELS[person.role] || "-", // Add roleLabel
    });
    setPeopleId(person._id);
    setPeopleSearchText(person.name);
    setPeopleSuggestions([]);
  };

  const handlePersonClick = (person) => {
    setSelectedPerson({
      ...person,
      // Preserve roleLabel if already exists, otherwise generate it
      roleLabel: person.roleLabel || ROLE_LABELS[person.role] || "-",
    });
    setPeopleId(person._id);
    setPeopleSearchText(person.name);
    setPeopleSuggestions([]);
  };

  // Toggle Upline visibility
  const toggleUpline = () => {
    setUpline(!upline);
  };

  // Memoize getUplineDetails using useCallback
  const getUplineDetails = useCallback(async () => {
    if (!selectedPerson) return [];

    try {
      let uplineDetails = [];
      const { role, _id } = selectedPerson;

      // Fetch full details from the people collection
      const peopleResponse = await axios.get(
        "http://localhost:3001/people/by-barangay",
        {
          params: { barangay: selectedBarangay._id },
        }
      );
      const peopleData = peopleResponse.data;

      // Fetch data based on the selected person's role
      if (role === "bco") {
        // bco's upline is the angatchair
        const bcoResponse = await axios.get(`http://localhost:3001/prince`, {
          params: { barangay: selectedBarangay._id },
        });
        const bcoData = bcoResponse.data;

        const matchingBco = bcoData.find(
          (person) => person.prince_id === _id
        );

        if (matchingBco) {
          const angatchair = peopleData.find(
            (person) => person._id === matchingBco.king_id
          );
          if (angatchair) {
            uplineDetails.push({
              ...angatchair,
              role: "angatchair", 
              roleLabel: "Angat Chair",
            });
          }
        }
      } else if (role === "pcs") {
        // pcs upline is the angat chair and bco
        const pcsResponse = await axios.get(
          `http://localhost:3001/general`,
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const pcsData = pcsResponse.data;

        const matchingPcs = pcsData.find(
          (person) => person.general_id === _id
        );

        if (matchingPcs) {
          const angatchair = peopleData.find(
            (person) => person._id === matchingPcs.king_id
          );
          const bco = peopleData.find(
            (person) => person._id === matchingPcs.prince_id
          );

          if (angatchair) {
            uplineDetails.push({
              ...angatchair,
              role: "angatchair",
              roleLabel: "Angat Chair",
            });
          }
          if (bco) {
            uplineDetails.push({
              ...bco,
              role: "bco",
              roleLabel: "BCO",
            });
          }
        }
      } else if (role === "pcl") {
        // pcl's upline is the angatchair, bco, and pcs
        const pclResponse = await axios.get(`http://localhost:3001/leader`, {
          params: { barangay: selectedBarangay._id },
        });
        const pclData = pclResponse.data.data;

        const matchingPcl = pclData.find(
          (person) => person.leader_id === _id
        );

        if (matchingPcl) {
          // Fetch the angatchair
          const angatchair = peopleData.find(
            (person) => person._id === matchingPcl.king_id
          );
          if (angatchair) {
            uplineDetails.push({
              ...angatchair,
              role: "angatchair",
              roleLabel: "Angat Chair",
            });
          }

          // Fetch the pcs
          const pcsResponse = await axios.get(
            `http://localhost:3001/general`,
            {
              params: { barangay: selectedBarangay._id },
            }
          );
          const pcsData = pcsResponse.data;

          const matchingPcs = pcsData.find(
            (person) => person.general_id === matchingPcl.general_id
          );

          if (matchingPcs) {
            // Fetch the bco associated with the general
            const bco = peopleData.find(
              (person) => person._id === matchingPcs.prince_id
            );
            if (bco) {
              uplineDetails.push({
                ...bco,
                role: "bco",
                roleLabel: "BCO",
              });
            }

            const pcs = peopleData.find(
              (person) => person._id === matchingPcs.general_id
            );
            if (pcs) {
              pcs.push({
                ...pcs,
                role: "pcs",
                roleLabel: "PCS",
              });
            }
          }
        }
      }

      if (uplineDetails.length === 0) {
        return [
          {
            name: `No upline found for the selected ${role}.`,
            role: "Unknown",
          },
        ];
      }

      return uplineDetails;
    } catch (error) {
      console.error("Error fetching upline details:", error);
      return [{ name: "Error fetching upline details.", role: "Unknown" }];
    }
  }, [selectedPerson, selectedBarangay]);

  useEffect(() => {
    const fetchUplineDetails = async () => {
      if (selectedPerson) {
        const details = await getUplineDetails();
        setUplineDetails(details);
      }
    };

    fetchUplineDetails();
  }, [selectedPerson, selectedBarangay, getUplineDetails]);

  // Toggle Downline visibility
  const toggleDownline = () => {
    setDownline(!downline);
  };

  const getDownlineDetails = useCallback(async () => {
    if (!selectedPerson) return [];

    try {
      const { role, _id } = selectedPerson;

      // Determine the endpoint based on the selected person's role
      const endpoint =
        role === "angatchair"
          ? "prince"
          : role === "bco"
          ? "general"
          : role === "pcs"
          ? "leader"
          : null;

      if (!endpoint) {
        // Leaders don't have downlines
        return {
          NoDownline: [{ name: "No downline available", role: "Unknown" }],
        };
      }

      const response = await axios.get(`http://localhost:3001/${endpoint}`, {
        params: { barangay: selectedBarangay._id },
      });

      const data = endpoint === "leader" ? response.data.data : response.data;

      // Fetch full details from the people collection
      const peopleResponse = await axios.get(
        "http://localhost:3001/people/by-barangay",
        {
          params: { barangay: selectedBarangay._id },
        }
      );
      const peopleData = peopleResponse.data;

      // Filter downline based on the selected person's role
      const downlineData = data.filter(
        (person) => person[`${role}_id`] === _id
      );

      if (downlineData.length === 0) {
        return {
          NoDownline: [
            {
              name: `No downline found for the selected ${role}.`,
              role: "Unknown",
            },
          ],
        };
      }

      // Determine roleLabel based on the endpoint (downline type)
      const roleLabel =
        endpoint === "prince"
          ? "BCO"
          : endpoint === "general"
          ? "PCS"
          : endpoint === "leader"
          ? "PCL"
          : "Unknown";

      // Format downline details with role keys and labels
      const downlineDetails = downlineData.map((person) => {
        const mergedPerson = peopleData.find(
          (p) => p._id === person[`${endpoint}_id`]
        );

        return {
          ...mergedPerson,
          role: endpoint, // Preserve original role key ("bco", "pcs", etc.)
          roleLabel, // Add display label ("BCO", "PCS", etc.)
        };
      });

      // Group by role
      return { [roleLabel]: downlineDetails };
    } catch (error) {
      console.error("Error fetching downline details:", error);
      return {
        Error: [{ name: "Error fetching downline details.", role: "Unknown" }],
      };
    }
  }, [selectedPerson, selectedBarangay]);

  useEffect(() => {
    const fetchDownlineDetails = async () => {
      if (selectedPerson) {
        const details = await getDownlineDetails();
        setDownlineDetails(details);
      }
    };

    fetchDownlineDetails();
  }, [selectedPerson, selectedBarangay, getDownlineDetails]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-4">
      <div className="bg-white p-6 rounded shadow-md w-[400px] space-y-4">
        <BarangayDropdown
          onBarangayChange={handleBarangayChange}
          barangays={barangays}
          selectedBarangay={selectedBarangay}
        />

        <PeopleSearchBox
          searchText={peopleSearchText}
          handleSearchChange={handlePeopleSearchChange}
          suggestions={peopleSuggestions}
          handlePersonSelect={handlePeopleSelect}
        />
      </div>

      {/* DETAILS */}
      <div className="bg-white p-6 rounded shadow-md w-[800px] text-left">
        <h3 className="text-xl font-bold mb-5">DETAILS</h3>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr>
              <td className="border p-2 font-bold w-1/5">FULL NAME: </td>
              <td className="border p-2 w-4/5">{selectedPerson.name || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">PRECINCT NO: </td>
              <td className="border p-2 w-4/5 uppercase">
                {selectedPerson.precinct || "-"}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">PUROK: </td>
              <td className="border p-2 w-4/5 uppercase">
                {selectedPerson.purok || "-"}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">ADDRESS: </td>
              <td className="border p-2 w-4/5 uppercase">
                {selectedPerson.address || "-"}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">ROLE: </td>
              <td className="border p-2 w-4/5 text-red-500 font-semibold uppercase">
                {selectedPerson.roleLabel || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* UPLINE BUTTON AND DETAILS */}
        <div className="mt-5">
          <button
            onClick={toggleUpline}
            className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-400"
          >
            {upline ? "Hide Upline" : "Show Upline"}
          </button>

          {upline && selectedPerson && (
            <div className="mt-4">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {uplineDetails.map((uplinePerson, index) => (
                    <tr
                      key={index}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handlePersonClick(uplinePerson)}
                    >
                      <td className="border p-2 font-bold w-1/5 uppercase">
                        {uplinePerson.roleLabel}:
                      </td>
                      <td className="border p-2 w-4/5">{uplinePerson.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DOWNLINE BUTTON AND DETAILS */}
        <div className="mt-5">
          <button
            onClick={toggleDownline}
            className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-400"
          >
            {downline ? "Hide Downline" : "Show Downline"}
          </button>

          {downline && selectedPerson && (
            <div className="mt-4">
              {Object.entries(downlineDetails).map(([role, people], index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-xl font-bold mb-5">{role}:</h3>
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {Array.isArray(people) &&
                        people.map((person, idx) => (
                          <tr
                            key={idx}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handlePersonClick(person)}
                          >
                            <td className="border p-2 w-full">{person.name}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
