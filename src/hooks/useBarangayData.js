import { useContext, useEffect, useState } from "react";
import BarangayContext from "../contexts/BarangayContext";

export const useFilteredPeople = () => {
  const { selectedBarangay, people } = useContext(BarangayContext);
  const [filteredPeople, setFilteredPeople] = useState([]);

  useEffect(() => {
    setFilteredPeople(
      selectedBarangay
        ? people.filter((person) => person.barangay_id === selectedBarangay._id
      )
        : []
    );
  }, [selectedBarangay, people]);

  return filteredPeople;
};
