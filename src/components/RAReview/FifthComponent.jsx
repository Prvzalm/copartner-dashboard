import React, { useState, useEffect } from "react";
import axios from "axios";

const FifthComponent = ({ handleNextStep, onBoardId }) => {
  const [agreementData, setAgreementData] = useState({
    agreementText: "",
    smsAgreement: false,
    signature: "",
    status: "Pending",
  });

  // Fetch data from the API when the component mounts
  useEffect(() => {
    axios
      .get(`https://copartners.in:5136/api/Agreement/${onBoardId}`)
      .then((response) => {
        setAgreementData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching agreement data:", error);
      });
  }, [onBoardId]);

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setAgreementData((prevState) => ({ ...prevState, status: newStatus }));

    // PATCH request to update the status in the backend
    axios
      .patch(`https://copartners.in:5136/api/Agreement/${onBoardId}`, {
        status: newStatus,
      })
      .then((response) => {
        console.log("Status updated successfully:", response.data);
        handleNextStep(); // Move to the next step if needed
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex bg-gray-100 py-2 px-4 justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Step 5: Agreement</h1>
        <div>
          <select
            value={agreementData.status}
            onChange={handleStatusChange}
            className="px-4 py-2 border rounded-lg bg-white shadow-sm"
          >
            <option value="Pending">Pending</option>
            <option value="Complete">Complete</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="px-8">
        {/* Display Agreement Text */}
        <div className="mb-8">
          <p className="text-lg bg-gray-100 px-4 py-2 font-medium mb-2">
            Agreement Text
          </p>
          <p className="bg-white border border-gray-300 rounded-lg p-4">
            {agreementData.agreementText || "No agreement text provided."}
          </p>
        </div>

        {/* Display SMS Agreement */}
        <div className="mb-8">
          <p className="text-lg bg-gray-100 px-4 py-2 font-medium mb-2">
            SMS Agreement
          </p>
          <p className="bg-white border border-gray-300 rounded-lg p-4">
            {agreementData.smsAgreement === "true"
              ? "SMS Agreement: Enabled"
              : "SMS Agreement: Disabled"}
          </p>
        </div>

        {/* Display Signature */}
        <div className="mb-8">
          <p className="text-lg bg-gray-100 px-4 py-2 font-medium mb-2">
            Signature
          </p>
          <div className="border border-gray-300 bg-white rounded-lg p-6">
            {agreementData.signature ? (
              <img
                src={agreementData.signature}
                alt="Signature"
                className="object-cover"
              />
            ) : (
              <p>No signature provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FifthComponent;
