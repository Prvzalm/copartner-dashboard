import React, { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";
import { toast } from "react-toastify"; // Assuming you're using react-toastify for notifications
import CreateTemplate from "./CreateTemplate"; // Import the CreateTemplate component
import Bin from "../../assets/TrashBinMinimalistic.png";
const Campaign = ({ templateData = [], fetchTemplateData }) => {
  console.log(templateData);
  
  const rowsPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false); // State to control the popup visibility

  // Ensure groupData is an array and access the actual data array
  const validGroupData = Array.isArray(templateData) ? templateData : [];

  // Calculate the total number of pages
  const totalPages = Math.ceil(validGroupData.length / rowsPerPage);

  // Get the data for the current page
  const currentData = validGroupData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to delete a template by ID
  const onDeleteGroup = async (templateId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this template?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://whatsapp.copartner.in/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the Template");
      }

      toast.success("Template deleted successfully");
      fetchTemplateData(); // Refetch the data after successful deletion
      
    } catch (error) {
      toast.error(`Failed to delete Template: ${error.message}`);
      console.error("Error deleting Template:", error);
    }
  };

  // Function to handle opening the popup
  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  // Function to handle closing the popup
  const handleClosePopup = () => {
    setShowPopup(false);
    fetchTemplateData(); // Refetch the data after a new template is added
  };

  return (
    <div className="py-4 px-8">
      <div className="flex justify-between">
      <h2 className="pl-3 text-xl font-semibold">Template Listing</h2>
      <button className="border rounded-lg border-black p-2" onClick={handleOpenPopup}>
            +Add
          </button>
      </div>
      <div className="table-container overflow-x-auto">
       
        <div className="flex justify-end space-x-4">
         
        </div>

        <table className="table-list min-w-max mt-4">
          <thead>
            <tr className="requestColumns">
              <th style={{ textAlign: "left", paddingLeft: "2rem" }}>Date</th>
              <th style={{ textAlign: "left" }}>Name</th>
              <th>Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 &&
              currentData.map((group) => {
                const { _id: templateId, name, dateCreated, campaignName } = group;
               const  newDate = new Date(dateCreated);
               const formattedDate = newDate.toLocaleDateString(); // Get templateId from _id field
                return (
                  <tr key={templateId} className="request-numbers font-semibold">
                    <td style={{ textAlign: "left", paddingLeft: "2rem" }} className="p-3">
                      {formattedDate || "N/A"} {/* Show the date the template was created */}
                    </td>
                    <td style={{ textAlign: "left" }} className="p-3">
                      {name || "N/A"} {/* Show the template name */}
                    </td>
                    <td className="p-3">{campaignName || "N/A"} {/* Show the campaign name */}</td>
                    <td className="p-3">
                      <button
                        className="btn btn-danger"
                         // Call the delete function with templateId
                      >
                        <img
                          className="w-6 h-6 cursor-pointer"
                          src={Bin}
                          alt="Delete"
                          onClick={() => onDeleteGroup(templateId)}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="pagination-controls mt-4 flex justify-center items-center">
        <button
          className="btn btn-primary mx-2 border border-black rounded-lg p-1"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-primary mx-2 border border-black rounded-lg p-1"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Popup for adding a new template */}
      {showPopup && <CreateTemplate closePopup={handleClosePopup} />}
    </div>
  );
};

export default Campaign;
