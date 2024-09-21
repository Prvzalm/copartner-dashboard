import React, { useState, useEffect } from "react";
import axios from "axios";

const SecondComponent = ({ handleNextStep, onBoardId }) => {
  const [status, setStatus] = useState("Pending");
  const [complianceRecords, setComplianceRecords] = useState(null);
  const [description, setDescription] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    axios
      .get(`https://copartners.in:5136/api/BackgroundCheck/${onBoardId}`)
      .then((response) => {
        const data = response.data;
        setComplianceRecords(data.document);
        setDescription(data.description);
        setStatus(data.status);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Handle Status Change and PATCH request
  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);

    // Make PATCH request to update status
    axios
      .patch(`https://copartners.in:5136/api/BackgroundCheck/${onBoardId}`, {
        status: newStatus,
      })
      .then((response) => {
        console.log("Status updated:", response.data);
        handleNextStep(); // Call the next step function after updating status
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex bg-gray-100 py-2 px-8 justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">
          Step 2: Background Check on Past Activities
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
      <div className="mx-6">
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div>
            <p className="text-lg bg-gray-100 py-2 px-8 font-medium mb-2">
              Provide any relevant documents that attest to your clean
              background and compliance history
            </p>
            <div className="border text-center bg-gray-100 border-gray-300 mx-8 rounded-lg p-6">
              {complianceRecords ? (
                <div className="flex flex-col items-center">
                  <object
                    data={complianceRecords}
                    type="application/pdf"
                    className="w-full h-[400px]"
                  >
                    <p>
                      Your browser does not support PDFs. Please download the
                      PDF to view it.
                    </p>
                  </object>
                </div>
              ) : (
                <label className="text-gray-400 cursor-pointer">
                  <div className="h-32 w-48 flex items-center justify-center">
                    Upload Any Compliance Records
                  </div>
                  {/* <input
                    type="file"
                    accept=".pdf, .jpg, .png"
                    className="hidden"
                  /> */}
                </label>
              )}
            </div>
          </div>
        </div>

        <p className="text-lg bg-gray-100 px-8 py-2 font-medium mb-4">
          If applicable, please describe any past activities relevant to your
          financial advisory role, including any compliance checks or legal
          history
        </p>
        <textarea
          className="w-full h-32 border bg-gray-100 border-gray-300 rounded-lg p-4"
          placeholder="Enter relevant details here..."
          value={description}
          readOnly
        ></textarea>
      </div>
    </div>
  );
};

export default SecondComponent;
