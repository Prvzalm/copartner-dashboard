import React, { useState, useEffect } from "react";
import axios from "axios";

const FirstAPComponent = ({ onBoardAPId }) => {
  const [data, setData] = useState({
    ques1: "",
    ans1: "",
    ques2: "",
    ans2: "",
    ques3: "",
    ans3: "",
    ques4: "",
    ans4: "",
    status: "Pending",
  });

  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    if (onBoardAPId === "string") {
      console.error("onBoardAPId is undefined");
      return;
    }
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://copartners.in:5138/api/AffiliateMarketingExperienceAssessment/${onBoardAPId}`
        );
        if (response.data) {
          setData(response.data);
          setStatus(response.data.status);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, [onBoardAPId]);

  const handleStatusChange = async (e) => {
    const updatedStatus = e.target.value;
    setStatus(updatedStatus);

    try {
      const patchData = {
        status: updatedStatus,
      };

      // Making PATCH request to update the status
      await axios.patch(
        `https://copartners.in:5138/api/AffiliateMarketingExperienceAssessment/${onBoardAPId}`,
        patchData,
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
        <h1 className="text-2xl font-semibold">
          Step 1: Affiliate Marketing Experience Assessment
        </h1>
        <div>
          <select
            value={status}
            onChange={handleStatusChange}
            className="px-4 py-2 border rounded-lg bg-white shadow-sm"
          >
            <option value="Pending">Pending</option>
            <option value="Complete">Complete</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-8 mb-8">
        <div>
          <p className="text-lg font-medium mb-2">{data.ques1}</p>
          <textarea
            className="w-full h-32 border bg-gray-100 border-gray-300 rounded-lg p-4"
            value={data.ans1}
            readOnly
          ></textarea>
        </div>

        <div>
          <p className="text-lg font-medium mb-2">{data.ques2}</p>
          <textarea
            className="w-full h-32 border bg-gray-100 border-gray-300 rounded-lg p-4"
            value={data.ans2}
            readOnly
          ></textarea>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-8 mb-8">
        <div>
          <p className="text-lg font-medium mb-2">{data.ques3}</p>
          <textarea
            className="w-full h-32 border bg-gray-100 border-gray-300 rounded-lg p-4"
            value={data.ans3}
            readOnly
          ></textarea>
        </div>

        <div>
          <p className="text-lg font-medium mb-2">{data.ques4}</p>
          <textarea
            className="w-full h-32 border bg-gray-100 border-gray-300 rounded-lg p-4"
            value={data.ans4}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default FirstAPComponent;
