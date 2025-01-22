import React from "react";

export default function PersonDetails({ person, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow-md w-[800px]">
        <h3 className="text-xl font-bold mb-5">PERSON DETAILS</h3>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr>
              <td className="border p-2 font-bold w-1/5">ID: </td>
              <td className="border p-2 w-4/5">{person._id || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Voter Number: </td>
              <td className="border p-2 w-4/5">{person.voter_number || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Full Name: </td>
              <td className="border p-2 w-4/5">{person.name || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Precinct No: </td>
              <td className="border p-2 w-4/5 uppercase">
                {person.precinct || "-"}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Barangay ID: </td>
              <td className="border p-2 w-4/5">{person.barangay_id || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Barangay Name: </td>
              <td className="border p-2 w-4/5">
                {person.barangay_name || "-"}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Functionary: </td>
              <td className="border p-2 w-4/5">{person.functionary || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Sector: </td>
              <td className="border p-2 w-4/5">{person.sector || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Role: </td>
              <td className="border p-2 w-4/5 text-red-500 font-semibold uppercase">
                {person.role === "Angat Chair"
                  ? "King"
                  : person.role === "ABLC"
                  ? "Prince"
                  : person.role === "APC"
                  ? "General"
                  : person.role === "FL"
                  ? "Leader"
                  : "Unknown" || "-"}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Number: </td>
              <td className="border p-2 w-4/5">{person.number || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Remarks: </td>
              <td className="border p-2 w-4/5">{person.remarks || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Purok: </td>
              <td className="border p-2 w-4/5 uppercase">
                {person.purok || "-"}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Code: </td>
              <td className="border p-2 w-4/5">{person.code || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Referred by ID: </td>
              <td className="border p-2 w-4/5">{person.referred_by_id || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold w-1/5">Referred By: </td>
              <td className="border p-2 w-4/5">{person.referred_by || "-"}</td>
            </tr>
          </tbody>
        </table>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
