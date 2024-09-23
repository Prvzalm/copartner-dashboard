import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const FirstComponent = ({ handleNextStep, onBoardId }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [sebiCertificate, setSebiCertificate] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [companyDetails, setCompanyDetails] = useState("");
  const [companyDetailQues, setCompanyDetailQues] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    axios
      .get(`https://copartners.in:5136/api/SEBIRegVerification/${onBoardId}`)
      .then((response) => {
        const data = response.data;
        setProfileImage(data.profilePhoto);
        setSebiCertificate(data.regCertificate);
        setCompanyDetails(data.companyDetails);
        setCompanyDetailQues(data.companyDetailQues);
        setStatus(data.status);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleProfileImageChange = (event) => {
    setProfileImage(event.target.files[0]);
  };

  const handleSebiCertificateChange = (event) => {
    setSebiCertificate(event.target.files[0]);
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);

    // Make PATCH request to update status
    axios
      .patch(
        `https://copartners.in:5136/api/SEBIRegVerification/${onBoardId}`,
        {
          status: newStatus,
        }
      )
      .then((response) => {
        toast.success(response.message);
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
          Step 1: SEBI Registration Verification
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
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Profile Image</p>
          <div className="border border-gray-300 bg-gray-100 rounded-lg p-6 flex justify-center items-center">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-[400px] w-full object-cover"
              />
            ) : (
              <label className="text-gray-400 cursor-pointer">
                <div className="h-32 w-48 border-dashed flex items-center justify-center rounded-full">
                  Profile Image
                </div>
                {/* <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                /> */}
              </label>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-medium mb-2">SEBI Certificate</p>
          <div className="border border-gray-300 bg-gray-100 rounded-lg p-6">
            {sebiCertificate ? (
              <div className="flex flex-col items-center">
              <object
                data={sebiCertificate}
                type="application/pdf"
                width="100%"
                height="400px"
              >
                <p>
                  Your browser does not support PDFs. Please download the
                  PDF to view it.
                </p>
              </object>
            </div>
            ) : (
              <label className="text-gray-400 cursor-pointer">
                <div className="h-32 w-48 border-dashed mx-auto">
                  Upload Your Certificate
                </div>
                {/* <input
                  type="file"
                  accept=".pdf, .jpg, .png"
                  onChange={handleSebiCertificateChange}
                  className="hidden"
                /> */}
              </label>
            )}
          </div>
        </div>
      </div>

      <p className="p-4 bg-gray-100 text-lg font-medium mb-4">
        {companyDetailQues}
      </p>
      <textarea
        className="w-full h-32 border bg-gray-100 border-gray-300 rounded-lg p-4"
        placeholder={companyDetails}
        readOnly
      ></textarea>
      <ToastContainer />
    </div>
  );
};

export default FirstComponent;
