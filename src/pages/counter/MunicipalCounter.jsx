import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";

export default function MunicipalCounter() {
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch the list of municipalities from API
        const municipalitiesRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/barangay/municipalities`
        );
        const municipalitiesList = municipalitiesRes.data.municipalities;

        // Then fetch both people counts and targets
        const [peopleRes, targetsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/people/roles-by-municipality`),
          axios.get(`${process.env.REACT_APP_API_URL}/barangay/targets-by-municipality`),
        ]);

        // Merge data
        const mergedData = municipalitiesList.map((name) => {
          const municipalityData = peopleRes.data.find((d) => d._id === name);
          return {
            name,
            peopleWithRoles: municipalityData?.peopleWithRoles || 0,
            totalPeople: municipalityData?.totalPeople || 0,
            target: targetsRes.data.find((d) => d._id === name)?.totalTarget || 0,
          };
        });
        setMunicipalities(mergedData);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const calculateProgress = (peopleWithRoles, target) => {
    return target === 0
      ? 0
      : Math.min(
          parseFloat(((peopleWithRoles / target) * 100).toFixed(2)),
          100
        );
  };

  if (loading) {
    return <Loading message="Please wait..." />;
  }
  if (error)
    return <p className="text-center p-4 text-red-500">Error: {error}</p>;

  const handleGaugeClick = (municipalityName) => {
    navigate(`/counter/${municipalityName}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-7xl p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center uppercase text-red-600 mb-8">
        Municipalities Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {municipalities.map((municipality, index) => {
          const progress = calculateProgress(
            municipality.peopleWithRoles,
            municipality.target
          );
          const circumference = 94.25;
          const strokeDashoffset =
            circumference - (circumference * progress) / 100;

          return (
            <div
              key={index}
              onClick={() => handleGaugeClick(municipality.name)}
              className="group relative bg-white p-4 rounded-lg shadow-md 
                       transition-all duration-300 hover:shadow-lg 
                       hover:scale-[1.02] cursor-pointer border-2 border-transparent
                       hover:border-red-200"
            >
              {/* Progress Circle */}
              <div className="relative mx-auto w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]">
                <svg viewBox="0 0 36 36" className="rotate-90 w-full h-full">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="#f0f0f0"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="#ff0000"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>

                {/* Progress Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center space-y-1">
                    <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {progress.toFixed(2)}%
                    </div>
                    <div className="text-xs sm:text-sm text-red-600">
                      {municipality.target.toLocaleString()} Target
                    </div>
                  </div>
                </div>
              </div>

              {/* Municipality Info */}
              <div className="mt-4 text-center">
                <h3 className="text-sm sm:text-base font-semibold text-red-600 mb-1">
                  {municipality.name}{" "}
                  <span className="text-red-500 text-xs">
                    (RV: {municipality.totalPeople})
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="text-red-600 font-medium">
                    {municipality.peopleWithRoles.toLocaleString()} /{" "}
                    {municipality.target.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
