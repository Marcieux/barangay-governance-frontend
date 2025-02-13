import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BarangaySearchBox from "../../components/BarangaySearchBox";
import BarangayContext from "../../contexts/BarangayContext";
import Loading from "../../components/Loading";

export default function GetNames() {
  const { selectedBarangay, setSelectedBarangay } =
    useContext(BarangayContext);
  const [showStructure, setShowStructure] = useState(false);
  const [bcoCount, setBcoCount] = useState(0);
  const [pcsCount, setPcsCount] = useState(0);
  const [pclCount, setPclCount] = useState(0);
  const [fmCount, setFmCount] = useState(0);
  const [isBarangaySelected, setIsBarangaySelected] = useState(false); // Tracks if a barangay is selected
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  // Fetch bco, pcs, pcl, fm from the API
  useEffect(() => {
    if (selectedBarangay) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [bcoRes, pcsRes, pclRes, fmRes] =
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
          setBcoCount(bcoRes.data.count || 0);
          setPcsCount(pcsRes.data.count || 0);
          setPclCount(pclRes.data.count || 0);
          setFmCount(fmRes.data.count || 0);
        } catch (error) {
          console.error("Error fetching data:", error);
          setBcoCount(0);
          setPcsCount(0);
          setPclCount(0);
          setFmCount(0);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedBarangay]);

  
  const handleBcoClick = async () => {
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

        // Filter the BCOs based on barangay id and role
        const bcos = people
          .filter(
            (person) =>
              person.barangay_id === selectedBarangay._id &&
              person.role === "bco"
          )
          .map((bco) => {
            return {
              name: bco.name,
              number: bco.number,
              precinct: bco.precinct,
              prince_id: bco._id, // This ID of prince in the people collection.
              purok: bco.purok,
            };
          });

        // Fetch all bco data from the selected barangay
        const bcoResponse = await axios.get(
          "http://localhost:3001/prince/",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const bcoData = bcoResponse.data;

        // Filter and map to find pcs for each bco
        const bcoPcs = bcos.map((bco) => {
          // Find the matching bco in the `bcoData` by comparing `prince_id`
          const matchedBco = bcoData.find(
            (bcoRecord) => bcoRecord.prince_id === bco.prince_id
          );

          // Extract the number of pcs if matched, otherwise 0
          const pcsCount = matchedBco?.general?.length || 0;
          
          // Return a summary object
          return {
            bcoName: bco.name,
            pcsCount,
          };
        });

        // Navigate to AngatKa page with the relevant data
        navigate(`/get-names/${selectedBarangay.barangay_name}/bco`, {
          state: {
            barangayName: selectedBarangay.barangay_name,
            acName: selectedBarangay.king_name,
            bcos: bcos,
            bcoPcs: bcoPcs,
          },
        });
      } catch (error) {
        console.error("Failed to fetch or process BCOs:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      console.warn("No barangay name selected.");
    }
  };

 
  const handlePcsClick = async () => {
    if (selectedBarangay) {
      setLoading(true);
      try {
        // Fetch the people data to filter pcs based on the barangay and role
        const peopleResponse = await axios.get(
          "http://localhost:3001/people/by-barangay",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const people = peopleResponse.data;

        // Filter pcs from the people collection
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
            general_id: pcs._id,
          }));

        // Fetch the pcs data for the selected barangay
        const pcsResponse = await axios.get(
          "http://localhost:3001/general",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const pcsData = pcsResponse.data;

        // Filter pcsData to match the selected barangay
        const filteredPcsData = pcsData.filter(
          (pcs) => pcs.barangay_id === selectedBarangay._id
        );

        // Merge pcs data with their details from the people collection
        const mappedPcs = filteredPcsData.map((pcs) => {
          const matchingPcs = pcsDetails.find(
            (person) => person.general_id === pcs.general_id
          );

          return {
            general_id: pcs.general_id,
            general_name: pcs.general_name,
            prince_id: pcs.prince_id,
            prince_name: pcs.prince_name,
            number: matchingPcs?.number || "-",
            precinct: matchingPcs?.precinct || "-",
            purok: pcs.purok || "-",
            leader: pcs.leader || [],
            pclCount: (pcs.leader || []).length
          };
        });

        // Navigate and pass the pcs with the details
        navigate(`/get-names/${selectedBarangay.barangay_name}/pcs/`, {
          state: {
            barangayName: selectedBarangay.barangay_name,
            acName: selectedBarangay.king_name,
            pcs: mappedPcs,
          },
        });
      } catch (error) {
        console.error("Error fetching PCS:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.warn("No barangay name selected.");
    }
  };


  const handlePclClick = async () => {
    if (selectedBarangay) {
      setLoading(true);

      try {
        // Fetch the people data to filter pcl based on the barangay and role
        const peopleResponse = await axios.get(
          "http://localhost:3001/people/by-barangay",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const people = peopleResponse.data;

        // Filter pcl from the people collection
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
            leader_id: pcl._id,
          }));

        // Fetch the pcl data for the selected barangay
        const pclResponse = await axios.get("http://localhost:3001/leader", {
          params: { barangay: selectedBarangay._id },
        });

        const pclData = pclResponse.data.data;

        // Filter pclData to match the selected barangay
        const filteredPclData = pclData.filter(
          (pcl) => pcl.barangay_id === selectedBarangay._id
        );

        // Merge pcl data with their details from the people collection
        const mappedPcl = filteredPclData.map((pcl) => {
          const matchingPcl = pclDetails.find(
            (person) => person.leader_id === pcl.leader_id
          );

          return {
            leader_id: pcl.leader_id,
            leader_name: pcl.leader_name,
            general_id: pcl.general_id,
            general_name: pcl.general_name,
            number: matchingPcl?.number || "-",
            precinct: matchingPcl?.precinct || "-",
            purok: pcl.purok || "-",
            member: pcl.member || [],
            fmCount: (pcl.member || []).length
          };
        });

        // Navigate to AngatKa page with the relevant data
        navigate(`/get-names/${selectedBarangay.barangay_name}/pcl`, {
          state: {
            barangayName: selectedBarangay.barangay_name,
            acName: selectedBarangay.king_name,
            pcl: mappedPcl,
          },
        });
      } catch (error) {
        console.error("Error fetching PCL:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.warn("No barangay name selected.");
    }
  };


  const handleFmClick = async () => {
    if (selectedBarangay) {
      setLoading(true);

      try {
        // Fetch the people data to filter fm based on the barangay and role
        const peopleResponse = await axios.get(
          "http://localhost:3001/people/by-barangay",
          {
            params: { barangay: selectedBarangay._id },
          }
        );
        const people = peopleResponse.data;

        // Filter fm from the people collection
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
            member_id: fm._id,
          }));

        // Fetch the fm data for the selected barangay
        const fmResponse = await axios.get("http://localhost:3001/member", {
          params: { barangay: selectedBarangay._id },
        });

        const fmData = fmResponse.data.data;

        // Filter fmData to match the selected barangay
        const filteredFmData = fmData.filter(
          (fm) => fm.barangay_id === selectedBarangay._id
        );

        // Merge fm data with their details from the people collection
        const mappedFm = filteredFmData.map((fm) => {
          const matchingFm = fmDetails.find(
            (person) => person.member_id === fm.member_id
          );

          return {
            member_id: fm.member_id,
            member_name: fm.member_name,
            leader_id: fm.leader_id,
            leader_name: fm.leader_name,
            number: matchingFm?.number || "-",
            precinct: matchingFm?.precinct || "-",
            purok: fm.purok || "-",
          };
        });

        // Navigate to AngatKa page with the relevant data
        navigate(`/get-names/${selectedBarangay.barangay_name}/fm`, {
          state: {
            barangayName: selectedBarangay.barangay_name,
            acName: selectedBarangay.king_name,
            fm: mappedFm,
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
                      onClick={handleBcoClick}
                    >
                      BCO:
                    </td>
                    <td className="border p-2">{bcoCount}</td>
                  </tr>
                  <tr>
                    <td
                      className="border p-2 font-bold cursor-pointer"
                      onClick={handlePcsClick}
                    >
                      PCS:
                    </td>
                    <td className="border p-2">{pcsCount}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td
                      className="border p-2 font-bold cursor-pointer"
                      onClick={handlePclClick}
                    >
                      PCL:
                    </td>
                    <td className="border p-2">{pclCount}</td>
                  </tr>
                  <tr>
                    <td
                      className="border p-2 font-bold cursor-pointer"
                      onClick={handleFmClick}
                    >
                      FM:
                    </td>
                    <td className="border p-2">{fmCount}</td>
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
