import React from "react";

export default function BarangayDropdown(props) {
  const { barangays, selectedBarangay, onBarangayChange, isOpen, setIsOpen } = props;
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-500">
        Barangay
      </label>
      <div className="relative" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between w-full p-2 border border-red-500 rounded cursor-pointer text-sm">
          {selectedBarangay ? selectedBarangay.barangay_name : "Choose a Barangay"}{" "}
          <i className="fa-solid fa-caret-down"></i>
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full bg-white border border-red-500 rounded mt-1 max-h-60 overflow-y-auto">
            {barangays.map((barangay) => (
              <div
                key={barangay._id}
                onClick={() => onBarangayChange(barangay)}
                className="p-2 cursor-pointer text-sm hover:bg-gray-100"
              >
                {barangay.barangay_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
