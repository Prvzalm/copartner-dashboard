import React, { useState, useEffect } from "react";
import axios from "axios";

const SecondAPComponent = ({ onBoardAPId }) => {
  const [data, setData] = useState({
    userId: "",
    profilePhoto: "",
    uploadIdDocuments: "",
    legalName: "",
    panCardNo: "",
    gstNo: "",
    address: "",
    state: "",
    status: "Pending",
  });

  useEffect(() => {
    if (onBoardAPId === "string") {
      console.error("onBoardAPId is undefined");
      return;
    }
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://copartners.in:5138/api/AdditionalInformation/${onBoardAPId}`
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

  const handleStatusChange = async (e) => {
    const updatedStatus = e.target.value;
    setData((prevData) => ({
      ...prevData,
      status: updatedStatus,
    }));

    try {
      // Make a PATCH request to update the status
      await axios.patch(
        `https://copartners.in:5138/api/AdditionalInformation/${onBoardAPId}`,
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
        <h1 className="text-2xl font-semibold">
          Step 2: Additional Information
        </h1>
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

      <div className="grid grid-cols-2 gap-8 px-8 mb-8">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Profile Photo</p>
          <div className="border border-gray-300 bg-gray-100 rounded-lg p-6 flex justify-center items-center">
            {data.profilePhoto ? (
              <img
                src={data.profilePhoto}
                alt="Profile"
                className="h-[400px] w-full object-cover"
              />
            ) : (
              <p className="text-gray-400">No Profile Photo Uploaded</p>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-medium mb-2">ID Document</p>
          <div className="border border-gray-300 bg-gray-100 rounded-lg p-6">
            {data.uploadIdDocuments ? (
              <div className="flex flex-col items-center">
                <object
                  data={data.uploadIdDocuments}
                  type="application/pdf"
                  className="w-full h-[400px]"
                >
                  <p>
                    Your browser does not support PDFs. Please download the
                    document to view it.
                  </p>
                </object>
              </div>
            ) : (
              <p className="text-gray-400">No ID Document Uploaded</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-8 mb-8">
        <div>
          <p className="text-lg font-medium mb-2">Legal Name</p>
          <input
            type="text"
            className="w-full border bg-gray-100 border-gray-300 rounded-lg p-4"
            value={data.legalName}
            readOnly
          />
        </div>

        <div>
          <p className="text-lg font-medium mb-2">PAN Card Number</p>
          <input
            type="text"
            className="w-full border bg-gray-100 border-gray-300 rounded-lg p-4"
            value={data.panCardNo}
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-8 mb-8">
        <div>
          <p className="text-lg font-medium mb-2">GST Number</p>
          <input
            type="text"
            className="w-full border bg-gray-100 border-gray-300 rounded-lg p-4"
            value={data.gstNo}
            readOnly
          />
        </div>

        <div>
          <p className="text-lg font-medium mb-2">State</p>
          <input
            type="text"
            className="w-full border bg-gray-100 border-gray-300 rounded-lg p-4"
            value={data.state}
            readOnly
          />
        </div>
      </div>

      <div className="mb-8 px-8">
        <p className="text-lg font-medium mb-2">Address</p>
        <textarea
          className="w-full h-32 border bg-gray-100 border-gray-300 rounded-lg p-4"
          value={data.address}
          readOnly
        ></textarea>
      </div>
    </div>
  );
};

export default SecondAPComponent;
