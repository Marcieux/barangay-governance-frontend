import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const BarangayContext = createContext();

export const BarangayProvider = ({ children }) => {
  const [barangays, setBarangays] = useState([]);
  const [people, setPeople] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState("");

  // Fetch barangays only once on component mount
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const response = await axios.get("http://localhost:3001/barangay");
        setBarangays(response.data);
      } catch (err) {
        console.error("Error fetching barangays:", err);
      }
    };
    fetchBarangays();
  }, []);

  // Fetch people whenever a barangay is selected
  useEffect(() => {
    const fetchPeopleByBarangay = async () => {
      if (selectedBarangay && selectedBarangay.barangay_name) {
        try {
          const response = await axios.get(
            "http://localhost:3001/people/by-barangay",
            {
              params: { barangay: selectedBarangay.barangay_name },
            }
          );
          setPeople(response.data);
        } catch (err) {
          console.error("Error fetching people:", err);
        }
      } else {
        setPeople([]);
      }
    };
    fetchPeopleByBarangay();
  }, [selectedBarangay]);

  return (
    <BarangayContext.Provider
      value={{
        barangays,
        setBarangays,
        people,
        setPeople,
        selectedBarangay,
        setSelectedBarangay,
      }}
    >
      {children}
    </BarangayContext.Provider>
  );
};

export default BarangayContext;
