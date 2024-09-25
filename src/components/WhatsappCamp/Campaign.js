// src/components/Campaign.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios"; // Import axios to make API requests
import CreateTemplate from "./CreateTemplate"; // Import the CreateTemplate component
import { FaTrashAlt, FaPlus } from "react-icons/fa"; // Using FontAwesome icons for better scalability
import { toast } from "react-toastify"; // Assuming you're using react-toastify for notifications
import Spinner from "./Spinner"; // Optional: A spinner component for loading states
import ConfirmModal from "./ConfirmModal"; 
import { SlRefresh } from "react-icons/sl";// Optional: A custom confirmation modal

const Campaign = ({ templateData = [], fetchTemplateData }) => {
  const rowsPerPage = 100; // Define how many rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false); // State to control the popup visibility
  const [isDeleting, setIsDeleting] = useState(false); // State to manage deletion loading
  const [deleteTemplateId, setDeleteTemplateId] = useState(null); // State to manage which template to delete
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State to control confirmation modal

  // Ensure templateData is an array and access the actual data array
  const validTemplateData = useMemo(() => {
    return Array.isArray(templateData) ? templateData : [];
  }, [templateData]);

  // Calculate the total number of pages
  const totalPages = useMemo(() => {
    return Math.ceil(validTemplateData.length / rowsPerPage);
  }, [validTemplateData.length, rowsPerPage]);

  // Get the data for the current page
  const currentData = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return validTemplateData.slice(startIdx, endIdx);
  }, [currentPage, rowsPerPage, validTemplateData]);

  // Handle pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to handle deletion confirmation
  const confirmDeleteTemplate = (templateId) => {
    setDeleteTemplateId(templateId);
    setShowConfirmModal(true);
  };

  // Function to delete a template by ID and refresh the data after deletion
  const onDeleteTemplate = async () => {
    if (!deleteTemplateId) return;

    setIsDeleting(true); // Start deletion loading state
    setShowConfirmModal(false); // Close confirmation modal

    try {
      const response = await axios.delete(
        `https://whatsapp.copartner.in/api/templates/${deleteTemplateId}`
      );

      if (response.status !== 200 && response.status !== 204) {
        throw new Error("Failed to delete the template");
      }

      toast.success("Template deleted successfully");
      fetchTemplateData(); // Refetch the data after successful deletion
    } catch (error) {
      toast.error(`Failed to delete template: ${error.message}`);
      console.error("Error deleting template:", error);
    } finally {
      setIsDeleting(false); // End deletion loading state
      setDeleteTemplateId(null); // Reset the deleteTemplateId
    }
  };

  // Function to handle opening the popup
  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  // Function to handle closing the popup
  const handleClosePopup = (shouldFetchData = false) => {
    setShowPopup(false);
    if (shouldFetchData) {
      fetchTemplateData(); // Refetch the data after a new template is added
    }
  };

  return (
    <div className="py-6 px-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex  justify-center gap-2">
<h2 className="text-2xl font-semibold">Template Listing</h2>
        <button className="   items-center text-black rounded-lg  font-bold" onClick={() => fetchTemplateData()}> 
        <SlRefresh className=" rounded-full text-xl items" /></button>

        </div>
        
        <button
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
          onClick={handleOpenPopup}
        >
          <FaPlus className="mr-2" />
          Add Template
        </button>
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]"> {/* Adjust based on total columns */}
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Message</th>
                <th className="text-center px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((template) => {
                  const { _id: templateId, name, dateCreated, campaignName } = template;
                  const formattedDate = formatDate(dateCreated);

                  return (
                    <tr
                      key={templateId}
                      className="hover:bg-gray-100 transition duration-200"
                    >
                      <td className="px-4 py-2">{formattedDate}</td>
                      <td className="px-4 py-2">{name || "N/A"}</td>
                      <td className="px-4 py-2">{campaignName || "N/A"}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          className="flex items-center justify-center bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200"
                          onClick={() => confirmDeleteTemplate(templateId)}
                          disabled={isDeleting}
                          aria-label={`Delete template ${name}`}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center px-4 py-8 text-gray-500"
                  >
                    No templates available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Loading Indicator */}
          {isDeleting && (
            <div className="flex justify-center items-center mt-4">
              <Spinner /> {/* Optional: A spinner component */}
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            className={`flex items-center px-4 py-2 border rounded-md ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-white hover:bg-gray-100"
            } transition duration-200`}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={`flex items-center px-4 py-2 border rounded-md ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-white hover:bg-gray-100"
            } transition duration-200`}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmModal
          title="Confirm Deletion"
          message="Are you sure you want to delete this template?"
          onConfirm={onDeleteTemplate}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Popup for adding a new template */}
      {showPopup && (
        <CreateTemplate
          closePopup={handleClosePopup}
          fetchTemplateData={fetchTemplateData}
        />
      )}
    </div>
  );
};

export default Campaign;
