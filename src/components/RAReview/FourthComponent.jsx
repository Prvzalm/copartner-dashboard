import React, { useState, useEffect } from "react";
import axios from "axios";

const FourthComponent = ({ handleNextStep, onBoardId }) => {
  const [behavioralData, setBehavioralData] = useState({
    userQues1: "",
    userAns1: "",
    userQues2: "",
    userAns2: "",
    status: "Pending",
  });

  // Fetch data from the API when the component mounts
  useEffect(() => {
    axios
      .get(`https://copartners.in:5136/api/BehaviorAssessment/${onBoardId}`)
      .then((response) => {
        setBehavioralData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching behavioral assessment data:", error);
      });
  }, [onBoardId]);

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setBehavioralData((prevState) => ({ ...prevState, status: newStatus }));

    // PATCH request to update the status in the backend
    axios
      .patch(`https://copartners.in:5136/api/BehaviorAssessment/${onBoardId}`, {
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
        <h1 className="text-2xl font-semibold">
          Step 4: Behavioral Assessment
        </h1>
        <div>
          <select
            value={behavioralData.status}
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
            {behavioralData.userQues1}
          </p>
          <p className="bg-white border border-gray-300 rounded-lg p-4">
            {behavioralData.userAns1}
          </p>
        </div>
        <div className="mb-8">
          <p className="text-lg bg-gray-100 px-4 py-2 font-medium mb-2">
            {behavioralData.userQues2}
          </p>
          <p className="bg-white border border-gray-300 rounded-lg p-4">
            {behavioralData.userAns2}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FourthComponent;
