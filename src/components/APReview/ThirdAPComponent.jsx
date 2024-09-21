import React, { useState, useEffect } from "react";
import axios from "axios";

const ThirdAPComponent = ({ onBoardAPId }) => {
  const [data, setData] = useState({
    userId: "",
    signature: "",
    checkBox: false,
    status: "Pending",
  });

  // Fetch data from API when component mounts
  useEffect(() => {
    if (onBoardAPId === "string") {
      console.error("onBoardAPId is undefined");
      return;
    }
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://copartners.in:5138/api/FinalReview/${onBoardAPId}`
        );
        if (response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, [onBoardAPId]);

  // Handle status change
  const handleStatusChange = async (e) => {
    const updatedStatus = e.target.value;
    setData((prevData) => ({
      ...prevData,
      status: updatedStatus,
    }));

    try {
      // Make PATCH request to update the status
      await axios.patch(
        `https://copartners.in:5138/api/FinalReview/${onBoardAPId}`,
        { status: updatedStatus },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex bg-gray-100 py-2 px-8 justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Step 3: Final Review</h1>
        <div>
          <select
            value={data.status}
            onChange={handleStatusChange}
            className="px-4 py-2 border rounded-lg bg-white shadow-sm"
          >
            <option value="Pending">Pending</option>
            <option value="Complete">Complete</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Display the Signature */}
      <div className="text-center mb-8">
        <p className="text-lg font-medium mb-2">Signature</p>
        <div className="border border-gray-300 bg-gray-100 rounded-lg p-6">
          {data.signature ? (
            <img
              src={data.signature}
              alt="Signature"
              className="h-[200px] w-full object-cover"
            />
          ) : (
            <p className="text-gray-400">No Signature Uploaded</p>
          )}
        </div>
      </div>

      {/* Display Checkbox */}
      <div className="mb-8 px-8">
        <p className="text-lg font-medium mb-2">Agreement Checkbox</p>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={data.checkBox}
            readOnly
            className="w-6 h-6"
          />
          <label className="ml-2">I agree to the terms and conditions</label>
        </div>
      </div>
    </div>
  );
};

export default ThirdAPComponent;
