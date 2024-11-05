import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const BarangayContext = createContext();

export const BarangayProvider = ({ children }) => {
  const [barangays, setBarangays] = useState([]);
  const [people, setPeople] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState("");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barangaysRes, peopleRes] = await Promise.all([
          axios.get("http://localhost:3001/barangay"),
          axios.get("http://localhost:3001/people"),
        ]);
        setBarangays(barangaysRes.data);
        setPeople(peopleRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

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
