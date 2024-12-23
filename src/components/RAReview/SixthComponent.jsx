import React, { useState, useEffect } from "react";
import axios from "axios";

const SixthComponent = ({ handleNextStep, onBoardId }) => {
  const [formData, setFormData] = useState({
    address: "",
    gstin: "",
    pan: "",
    freeTelegramChannel: "",
    paidTelegramChannel: "",
    channelName: "",
    currentFollowers: "",
    status: "Pending",
  });

  useEffect(() => {
    // Fetch user data from the API
    axios
      .get(`https://copartners.in:5136/api/User/${onBoardId}`)
      .then((response) => {
        const data = response.data;
        setFormData({
          address: data.address || "",
          gstin: data.gstin || "",
          pan: data.pan || "",
          freeTelegramChannel: data.freeTelegramchannel || "",
          paidTelegramChannel: data.paidTelegramChannel || "",
          channelName: data.channelName || "",
          currentFollowers: data.currentFollowers || "",
          status: data.status || "Pending",
        });
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [onBoardId]);

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setFormData((prevState) => ({ ...prevState, status: newStatus }));

    // PATCH request to update the status in the backend
    axios
      .patch(`https://copartners.in:5136/api/User/${onBoardId}`, {
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
          Step 6: Additional User Details
        </h1>
        <div>
          <select
            value={formData.status}
            onChange={handleStatusChange}
            className="px-4 py-2 border rounded-lg bg-white shadow-sm"
          >
            <option value="Pending">Pending</option>
            <option value="Complete">Complete</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
      <form className="px-8">
        <div className="mb-4">
          <label className="block font-medium mb-2">Address*</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">
            GSTIN (If applicable)
          </label>
          <input
            type="text"
            name="gstin"
            value={formData.gstin}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">PAN*</label>
          <input
            type="text"
            name="pan"
            value={formData.pan}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">
            Free Telegram Channel (Optional)
          </label>
          <input
            type="text"
            name="freeTelegramChannel"
            value={formData.freeTelegramChannel}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">
            Paid Telegram Channel (Optional)
          </label>
          <input
            type="text"
            name="paidTelegramChannel"
            value={formData.paidTelegramChannel}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">
            Channel Name/Brand Name
          </label>
          <input
            type="text"
            name="channelName"
            value={formData.channelName}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">
            Current Followers (if applicable)
          </label>
          <input
            type="number"
            name="currentFollowers"
            value={formData.currentFollowers}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>
      </form>
    </div>
  );
};

export default SixthComponent;
