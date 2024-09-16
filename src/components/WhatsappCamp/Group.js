import React, { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";
import { toast } from "react-toastify"; // Assuming you're using react-toastify for notifications

const Group = ({ groupData = [], fetchGroupData }) => {
  const rowsPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);

  // Ensure groupData is an array and access the actual data array
  const validGroupData = Array.isArray(groupData) ? groupData : [];

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

  // Displaying the correct count of users in each group
  const formatNumber = (number) => {
    return number.toLocaleString(); // This ensures the number displays correctly, even for large numbers
  };

  // Function to delete a group by ID
  const onDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this group?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5001/api/groups/${groupId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the group");
      }

      toast.success("Group deleted successfully");
      // Refetch the group data after successful deletion
      
    } catch (error) {
      toast.error(`Failed to delete group: ${error.message}`);
      console.error("Error deleting group:", error);
    }
  };

  return (
    <div className="py-4 px-8">
      <div className="table-container overflow-x-auto">
        <h2 className="pl-3 text-xl font-semibold">Group Data</h2>
        <div className="flex justify-end space-x-4">
          <button className="border rounded-lg border-black p-2">
            Send Message
          </button>
          <button className="border rounded-lg border-black p-2">
            Scheduling
          </button>
        </div>

        <table className="table-list min-w-max mt-4">
          <thead>
            <tr className="requestColumns">
              <th style={{ textAlign: "left", paddingLeft: "2rem" }}>Date</th>
              <th style={{ textAlign: "left" }}>Group Name</th>
              <th>User Count</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 &&
              currentData.map((group) => {
                const { _id: groupId, groupName, users = [] } = group; // Get groupId from _id field
                return (
                  <tr key={groupId} className="request-numbers font-semibold">
                    <td style={{ textAlign: "left", paddingLeft: "2rem" }} className="p-3">
                      {new Date().toLocaleDateString()} {/* Show today's date */}
                    </td>
                    <td style={{ textAlign: "left" }} className="p-3">
                      {groupName || "N/A"}
                    </td>
                    <td className="p-3">{formatNumber(users.length)}</td> {/* Display correct user count */}
                    <td className="p-3">{new Date().toLocaleTimeString()}</td> {/* Show current time */}
                    <td className="p-3">
                      <button
                        className="btn btn-danger"
                        onClick={() => onDeleteGroup(groupId)} // Call the delete function with groupId
                      >
                        <FaTrashCan />
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
          className="btn btn-primary mx-2"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-primary mx-2"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Group;
