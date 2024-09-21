import React, { useState, useEffect } from "react";
import axios from "axios";

const ThirdComponent = ({ handleNextStep, onBoardId }) => {
  const [complianceData, setComplianceData] = useState({
    userQues1: "",
    userAns1: "",
    userQues2: "",
    userAns2: "",
    userQues3: "",
    userAns3: "",
    userQues4: "",
    userAns4: "",
    status: "Pending",
  });
  const [complianceRecords, setComplianceRecords] = useState(null);

  // Fetch data from the API when the component mounts
  useEffect(() => {
    axios
      .get(`https://copartners.in:5136/api/IndustryCompliance/${onBoardId}`)
      .then((response) => {
        setComplianceData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching compliance data:", error);
      });
  }, [onBoardId]);

  const handleComplianceRecordsChange = (event) => {
    setComplianceRecords(event.target.files[0]);
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setComplianceData((prevState) => ({ ...prevState, status: newStatus }));

    // PATCH request to update the status in the backend
    axios
      .patch(`https://copartners.in:5136/api/IndustryCompliance/${onBoardId}`, {
        status: newStatus,
      })
      .then((response) => {
        console.log("Status updated successfully:", response.data);
        handleNextStep();
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex bg-gray-100 py-2 px-4 justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Step 3: Industry Compliance</h1>
        <div>
          <select
            value={complianceData.status}
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
        {/* Display Questions and Answers */}
        <div className="mb-8">
          <p className="text-lg bg-gray-100 px-4 py-2 font-medium mb-2">
            {complianceData.userQues1}
          </p>
          <p className="bg-white border border-gray-300 rounded-lg p-4">
            {complianceData.userAns1}
          </p>
        </div>
        <div className="mb-8">
          <p className="text-lg bg-gray-100 px-4 py-2 font-medium mb-2">
            {complianceData.userQues2}
          </p>
          <p className="bg-white border border-gray-300 rounded-lg p-4">
            {complianceData.userAns2}
          </p>
        </div>
        <div className="mb-8">
          <p className="text-lg bg-gray-100 px-4 py-2 font-medium mb-2">
            {complianceData.userQues3}
          </p>
          <p className="bg-white border border-gray-300 rounded-lg p-4">
            {complianceData.userAns3}
          </p>
        </div>
        <div className="mb-8">
          <p className="text-lg bg-gray-100 px-4 py-2 font-medium mb-2">
            {complianceData.userQues4}
          </p>
          <p className="bg-white border border-gray-300 rounded-lg p-4">
            {complianceData.userAns4}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThirdComponent;
