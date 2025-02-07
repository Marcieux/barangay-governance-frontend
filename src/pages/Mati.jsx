import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BarangaySearchBox from "../components/BarangaySearchBox";
import BarangayContext from "../contexts/BarangayContext";
import Loading from "../components/Loading"; // Adjust the path to match your file structure

export default function Mati() {
  const { selectedBarangay, setSelectedBarangay } =
    useContext(BarangayContext);
  const [showStructure, setShowStructure] = useState(false);
  const [princeCount, setPrinceCount] = useState(0);
  const [generalCount, setGeneralCount] = useState(0);
  const [leaderCount, setLeaderCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [isBarangaySelected, setIsBarangaySelected] = useState(false); // Tracks if a barangay is selected
  const [loading, setLoading] = useState(false); // Loading state for fetch calls
  const navigate = useNavigate();

  // Fetch the prince and generals from the API
  useEffect(() => {
    if (selectedBarangay) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [princesRes, generalsRes, leaderRes, memberRes] =
            await Promise.all([
              axios.get("http://localhost:3001/prince/stats/count", {
                params: { barangay: selectedBarangay._id },
              }),
              axios.get("http://localhost:3001/general/stats/count", {
                params: { barangay: selectedBarangay._id },
              }),
              axios.get("http://localhost:3001/leader/stats/count", {
                params: { barangay: selectedBarangay._id },
              }),
              axios.get("http://localhost:3001/member/stats/count", {
                params: { barangay: selectedBarangay._id },
              }),
            ]);
          setPrinceCount(princesRes.data.count || 0);
          setGeneralCount(generalsRes.data.count || 0);
          setLeaderCount(leaderRes.data.count || 0);
          setMemberCount(memberRes.data.count || 0);
        } catch (error) {
          console.error("Error fetching data:", error);
          setPrinceCount(0);
          setGeneralCount(0);
          setLeaderCount(0);
          setMemberCount(0);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedBarangay]);

  // Function to handle click on ABLC (Princes)
  const handleABLCClick = async () => {
    if (selectedBarangay) {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:3001/people/by-barangay",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const people = response.data;

        // Filter the princes based on barangay id and role
        const princes = people
          .filter(
            (person) =>
              person.barangay_id === selectedBarangay._id &&
              person.role === "prince"
          )
          .map((prince) => {
            return {
              name: prince.name,
              number: prince.number,
              precinct: prince.precinct,
              prince_id: prince._id, // This ID of prince in the people collection.
              purok: prince.purok,
            };
          });

        // Fetch all prince data from the selected barangay
        const princeResponse = await axios.get(
          "http://localhost:3001/prince/",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const princeData = princeResponse.data;

        // Filter and map to find generals for each prince
        const princeGeneral = princes.map((prince) => {
          // Find the matching prince in the `princeData` by comparing `prince_id`
          const matchedPrince = princeData.find(
            (princeRecord) => princeRecord.prince_id === prince.prince_id
          );

          // Extract the number of generals if matched, otherwise 0
          const generalsCount = matchedPrince?.general?.length || 0;

          // Return a summary object
          return {
            princeName: prince.name,
            generalsCount,
          };
        });

        // Navigate to AngatKa page with the relevant data
        navigate(`/get-names/${selectedBarangay.barangay_name}/ablc`, {
          state: {
            barangayName: selectedBarangay.barangay_name,
            kingName: selectedBarangay.king_name,
            princes: princes,
            princeGeneral: princeGeneral,
          },
        });
      } catch (error) {
        console.error("Failed to fetch or process ABLCs:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      console.warn("No barangay name selected.");
    }
  };

  // Function to handle click on APC (Generals)
  const handleAPCClick = async () => {
    if (selectedBarangay) {
      setLoading(true);
      try {
        // Fetch the people data to filter generals based on the barangay and role
        const peopleResponse = await axios.get(
          "http://localhost:3001/people/by-barangay",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const people = peopleResponse.data;

        // Filter generals from the people collection
        const generalDetails = people
          .filter(
            (person) =>
              person.barangay_id === selectedBarangay._id &&
              person.role === "general"
          )
          .map((general) => ({
            name: general.name,
            number: general.number,
            precinct: general.precinct,
            general_id: general._id,
          }));

        // Fetch the general data for the selected barangay
        const generalResponse = await axios.get(
          "http://localhost:3001/general",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const generalData = generalResponse.data;

        // Filter generalData to match the selected barangay
        const filteredGeneralData = generalData.filter(
          (general) => general.barangay_id === selectedBarangay._id
        );

        // Merge general data with their details from the people collection
        const mappedGenerals = filteredGeneralData.map((general) => {
          const matchingGeneral = generalDetails.find(
            (person) => person.general_id === general.general_id
          );

          return {
            general_id: general.general_id,
            general_name: general.general_name,
            prince_id: general.prince_id,
            prince_name: general.prince_name,
            number: matchingGeneral?.number || "-",
            precinct: matchingGeneral?.precinct || "-",
            purok: general.purok || "-",
            leader: general.leader || [],
            leaderCount: (general.leader || []).length
          };
        });

        // Navigate and pass the generals with the details
        navigate(`/get-names/${selectedBarangay.barangay_name}/apc/`, {
          state: {
            barangayName: selectedBarangay.barangay_name,
            kingName: selectedBarangay.king_name,
            generals: mappedGenerals,
          },
        });
      } catch (error) {
        console.error("Error fetching APCs:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.warn("No barangay name selected.");
    }
  };

  const handleFLClick = async () => {
    if (selectedBarangay) {
      setLoading(true);

      try {
        // Fetch the people data to filter leaders based on the barangay and role
        const peopleResponse = await axios.get(
          "http://localhost:3001/people/by-barangay",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const people = peopleResponse.data;

        // Filter leaders from the people collection
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
            leader_id: leader._id,
          }));

        // Fetch the leader data for the selected barangay
        const leaderResponse = await axios.get("http://localhost:3001/leader", {
          params: { barangay: selectedBarangay._id },
        });

        const leaderData = leaderResponse.data.data;

        // Filter leaderData to match the selected barangay
        const filteredLeaderData = leaderData.filter(
          (leader) => leader.barangay_id === selectedBarangay._id
        );

        // Merge leader data with their details from the people collection
        const mappedLeaders = filteredLeaderData.map((leader) => {
          const matchingLeader = leaderDetails.find(
            (person) => person.leader_id === leader.leader_id
          );

          return {
            leader_id: leader.leader_id,
            leader_name: leader.leader_name,
            general_id: leader.general_id,
            general_name: leader.general_name,
            number: matchingLeader?.number || "-",
            precinct: matchingLeader?.precinct || "-",
            purok: leader.purok || "-",
            member: leader.member || [],
            memberCount: (leader.member || []).length
          };
        });

        // Navigate to AngatKa page with the relevant data
        navigate(`/get-names/${selectedBarangay.barangay_name}/fl`, {
          state: {
            barangayName: selectedBarangay.barangay_name,
            kingName: selectedBarangay.king_name,
            leaders: mappedLeaders,
          },
        });
      } catch (error) {
        console.error("Error fetching FLs:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.warn("No barangay name selected.");
    }
  };

  const handleFMClick = async () => {
    if (selectedBarangay) {
      setLoading(true);

      try {
        // Fetch the people data to filter members based on the barangay and role
        const peopleResponse = await axios.get(
          "http://localhost:3001/people/by-barangay",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const people = peopleResponse.data;

        // Filter members from the people collection
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
            member_id: member._id,
          }));

        // Fetch the member data for the selected barangay
        const memberResponse = await axios.get("http://localhost:3001/member", {
          params: { barangay: selectedBarangay._id },
        });

        const memberData = memberResponse.data.data;

        // Filter memberData to match the selected barangay
        const filteredMemberData = memberData.filter(
          (member) => member.barangay_id === selectedBarangay._id
        );

        // Merge member data with their details from the people collection
        const mappedMembers = filteredMemberData.map((member) => {
          const matchingMember = memberDetails.find(
            (person) => person.member_id === member.member_id
          );

          return {
            member_id: member.member_id,
            member_name: member.member_name,
            leader_id: member.leader_id,
            leader_name: member.leader_name,
            number: matchingMember?.number || "-",
            precinct: matchingMember?.precinct || "-",
            purok: member.purok || "-",
          };
        });

        // Navigate to AngatKa page with the relevant data
        navigate(`/get-names/${selectedBarangay.barangay_name}/fm`, {
          state: {
            barangayName: selectedBarangay.barangay_name,
            kingName: selectedBarangay.king_name,
            members: mappedMembers,
          },
        });
      } catch (error) {
        console.error("Error fetching FMs:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.warn("No barangay name selected.");
    }
  };

  // Update the state when a barangay is selected
  useEffect(() => {
    if (selectedBarangay) {
      setIsBarangaySelected(true);
    }
  }, [selectedBarangay]);

  // Show loading spinner if fetching data
  if (loading) {
    return <Loading message="Please wait..." />;
  }

  return (
    <div className="flex flex-row items-center justify-between">
      {selectedBarangay && (
        <div className="text-center bg-white p-6 rounded shadow-md w-[700px] space-y-5">
          {/* <h1 className="text-3xl font-bold text-gray-800">MATI</h1> */}
          <p className="text-3xl font-bold text-gray-800 uppercase">
            Barangay: {selectedBarangay.barangay_name}
          </p>

          <div className="flex justify-between mx-10 text-sm">
            <button
              className="bg-red-500 text-white font-medium rounded-md p-2"
              onClick={() => setShowStructure(true)}
            >
              Structure
            </button>
            <button className="bg-red-500 text-white font-medium rounded-md p-2">
              Functionaries
            </button>
          </div>

          {showStructure && (
            <div className="mt-4 space-y-8 text-left">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="border p-2 font-bold">AC:</td>
                    <td className="border p-2">
                      {selectedBarangay.king_name || "No king assigned"}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td
                      className="border p-2 font-bold cursor-pointer"
                      onClick={handleABLCClick}
                    >
                      ABLC:
                    </td>
                    <td className="border p-2">{princeCount}</td>
                  </tr>
                  <tr>
                    <td
                      className="border p-2 font-bold cursor-pointer"
                      onClick={handleAPCClick}
                    >
                      APC:
                    </td>
                    <td className="border p-2">{generalCount}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td
                      className="border p-2 font-bold cursor-pointer"
                      onClick={handleFLClick}
                    >
                      FL:
                    </td>
                    <td className="border p-2">{leaderCount}</td>
                  </tr>
                  <tr>
                    <td
                      className="border p-2 font-bold cursor-pointer"
                      onClick={handleFMClick}
                    >
                      FM:
                    </td>
                    <td className="border p-2">{memberCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div
        className={`bg-white p-3 rounded shadow-md w-[400px] space-y-4 ${
          isBarangaySelected
            ? "absolute top-20 sm:right-40 md:right-12 lg:right-20 right-0"
            : "relative"
        }`}
      >
        <BarangaySearchBox setSelectedBarangay={setSelectedBarangay} />
      </div>
    </div>
  );
}
