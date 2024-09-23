import React, { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";
import Bin from "../../assets/TrashBinMinimalistic.png";
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

  // Function to delete a group by ID and refresh the data after deletion
  const onDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this group?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://whatsapp.copartner.in/api/groups/${groupId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the group");
      }

      toast.success("Group deleted successfully");

      // Refetch the group data after successful deletion
      fetchGroupData();
    } catch (error) {
      toast.error(`Failed to delete group: ${error.message}`);
      console.error("Error deleting group:", error);
    }
  };

  return (
    <div className="py-4 px-8">
      <div>
      <h2 className="pl-3 text-xl font-semibold">Group Data</h2>
      </div>
      <div className="table-container overflow-x-auto">
        

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
                const { _id: groupId, groupName, users = [], dateCreatedOn } = group; 
                const time = new Date(dateCreatedOn).toLocaleTimeString();
                const  newDate = new Date(dateCreatedOn);
               const formattedDate = newDate.toLocaleDateString();
                console.log(time);// Get groupId from _id field
                return (
                  <tr key={groupId} className="request-numbers font-semibold">
                    <td style={{ textAlign: "left", paddingLeft: "2rem" }} className="p-3">
                      {formattedDate || "N/A"} {/* Show today's date */}
                    </td>
                    <td style={{ textAlign: "left" }} className="p-3">
                      {groupName || "N/A"}
                    </td>
                    <td className="p-3">{formatNumber(users.length)}</td> {/* Display correct user count */}
                    <td className="p-3">{time}</td> {/* Show current time */}
                    <td className="p-3">
                      <button
                        // Call the delete function with groupId
                      >
                         <img
                          className="w-6 h-6 cursor-pointer"
                          src={Bin}
                          alt="Delete"
                          onClick={() => onDeleteGroup(groupId)}
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
    </div>
  );
};

export default Group;
