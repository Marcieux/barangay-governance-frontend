import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";

export default function BarangayCounter() {
  const { municipality } = useParams();
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCounts, setTotalCounts] = useState({
    ablc: 0,
    apc: 0,
    fl: 0,
    fm: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data in parallel
        const [barangaysRes, princesRes, generalsRes, leadersRes, memberRes] =
          await Promise.all([
            axios.get(
              `http://localhost:3001/barangay/by-municipality/${municipality}`
            ),
            axios.get("http://localhost:3001/prince"),
            axios.get("http://localhost:3001/general"),
            axios.get("http://localhost:3001/leader"),
            axios.get("http://localhost:3001/member"),
          ]);

        // Get all barangay IDs in the municipality
        const barangayIds = barangaysRes.data.map((b) => b._id);
        // Calculate totals
        const calculateTotal = (data) =>
          data.filter((item) => barangayIds.includes(item.barangay_id)).length;

        setTotalCounts({
          ablc: calculateTotal(princesRes.data),
          apc: calculateTotal(generalsRes.data),
          fl: calculateTotal(leadersRes.data.data),
          fm: calculateTotal(memberRes.data.data),
        });

        // Map through barangays and count roles
        const mergedData = barangaysRes.data.map((barangay) => {
          // Count ABLC (Princes) for this barangay
          const ablcCount = princesRes.data.filter(
            (prince) => prince.barangay_id === barangay._id
          ).length;

          // Count APC (Generals) for this barangay
          const apcCount = generalsRes.data.filter(
            (general) => general.barangay_id === barangay._id
          ).length;

          // Count FL (Leaders) for this barangay
          const flCount = leadersRes.data.data.filter(
            (leader) => leader.barangay_id === barangay._id
          ).length;

          // Count FM (Members) for this barangay
          const fmCount = memberRes.data.data.filter(
            (member) => member.barangay_id === barangay._id
          ).length;

          // Calculate total roles
          const totalRoles = ablcCount + apcCount + flCount;

          return {
            ...barangay,
            ablcCount,
            apcCount,
            flCount,
            fmCount,
            totalRoles,
          };
        });

        setBarangays(mergedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [municipality]);

  const calculateProgress = (totalRoles, target) => {
    return target === 0
      ? 0
      : Math.min(parseFloat(((totalRoles / target) * 100).toFixed(2)), 100);
  };

  if (loading) return <Loading message="Please Wait..." />;
  if (error)
    return <p className="text-center p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="bg-white rounded-xl my-10 shadow-lg max-w-7xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase text-red-600">
          {municipality.toUpperCase()} Barangays
        </h1>

        {/* Total Counts Container */}
        <div className="flex gap-4 sm:gap-6 flex-wrap">
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600">ABLC</div>
            <div className="text-lg sm:text-xl font-bold text-red-600">
              {totalCounts.ablc}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600">APC</div>
            <div className="text-lg sm:text-xl font-bold text-red-600">
              {totalCounts.apc}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600">FL</div>
            <div className="text-lg sm:text-xl font-bold text-red-600">
              {totalCounts.fl}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600">FM</div>
            <div className="text-lg sm:text-xl font-bold text-red-600">
              {totalCounts.fm}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {barangays.map((barangay, index) => {
          const progress = calculateProgress(
            barangay.totalRoles,
            barangay.target
          );
          const circumference = 94.25;
          const strokeDashoffset =
            circumference - (circumference * progress) / 100;

          return (
            <div
              key={index}
              className="group relative flex flex-col gap-5 bg-white p-4 rounded-lg shadow-md 
                       transition-all duration-300 hover:shadow-lg 
                       hover:scale-[1.02] cursor-pointer border-2 border-transparent
                       hover:border-red-200"
            >
              <div>
                {/* Barangay Info */}
                <div className="mt-4 text-center">
                  <h3 className="text-sm sm:text-base font-semibold text-red-600 truncate w-full">
                    {barangay.barangay_name}
                  </h3>
                  <span className="text-red-500 font-semibold text-xs">
                    (RV: {barangay.totalPeople})
                  </span>
                </div>

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
                        {barangay.target.toLocaleString()} Target
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {/* Role Counts */}
                <div className="space-y-2 text-sm text-red-600">
                  <div className="text-red-600 font-medium text-center">
                    {barangay.totalRoles.toLocaleString()} /{" "}
                    {barangay.target.toLocaleString()}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ABLC:</span>
                    <span className="font-semibold">{barangay.ablcCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>APC:</span>
                    <span className="font-semibold">{barangay.apcCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>FL:</span>
                    <span className="font-semibold">{barangay.flCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>FM:</span>
                    <span className="font-semibold">
                      {barangay.fmCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
