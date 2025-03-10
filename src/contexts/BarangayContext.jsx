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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/barangay`);
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
      if (selectedBarangay && selectedBarangay._id) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/people/by-barangay`,
            {
              params: { barangay: selectedBarangay._id },
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
