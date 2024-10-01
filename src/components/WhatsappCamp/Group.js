import React, { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";
import { SlRefresh } from "react-icons/sl"; // Using FontAwesome icon for better scalability
import { toast } from "react-toastify"; // Assuming you're using react-toastify for notifications
import PropTypes from "prop-types"; // For prop type checking
import InstantMessage from "./InstantMessage"; // Import the InstantMessage component

const Group = ({ groupData = [], fetchGroupData }) => {
  const rowsPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingGroupIds, setDeletingGroupIds] = useState([]); // To manage multiple deletions
  const [selectedGroupId, setSelectedGroupId] = useState(''); // For single group selection
  const [isInstantMessageOpen, setIsInstantMessageOpen] = useState(false); // For modal control

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
    return number.toLocaleString(); // Ensures correct display for large numbers
  };

  // Function to delete a group by ID and refresh the data after deletion
  const onDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this group?"
    );
    if (!confirmDelete) return;

    try {
      // Add the groupId to deletingGroupIds to show loading state
      setDeletingGroupIds((prev) => [...prev, groupId]);

      const response = await fetch(
        `https://whatsapp.copartner.in/api/groups/${groupId}`, // Ensure consistent API endpoint
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Include authentication headers if required
            // Authorization: `Bearer YOUR_ACCESS_TOKEN`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the group");
      }

      toast.success("Group deleted successfully");

      // Refetch the group data after successful deletion
      await fetchGroupData();
    } catch (error) {
      toast.error(`Failed to delete group: ${error.message}`);
      console.error("Error deleting group:", error);
    } finally {
      // Remove the groupId from deletingGroupIds
      setDeletingGroupIds((prev) => prev.filter((id) => id !== groupId));
    }
  };

  // Function to format date and time
  const formatDateTime = (dateCreatedOn) => {
    const newDate = dateCreatedOn ? new Date(dateCreatedOn) : null;

    // Format the time (24-hour format)
    const time = newDate
      ? newDate.toLocaleTimeString("en-GB", { hour12: false })
      : "N/A";

    // Format the date (YYYY-MM-DD)
    const formattedDate = newDate
      ? newDate.toISOString().split("T")[0]
      : "N/A";

    return { formattedDate, time };
  };

  // Function to handle radio button change
  const handleRadioChange = (groupId) => {
    setSelectedGroupId(groupId);
  };

  // Function to handle 'Instant Message' button click
  const openInstantMessage = () => {
    if (!selectedGroupId) {
      alert('Please select a group.');
      return;
    }
    setIsInstantMessageOpen(true);
  };

  const closeInstantMessage = () => {
    setIsInstantMessageOpen(false);
    setSelectedGroupId(''); // Optionally clear selection after sending message
  };

  return (
    <div className="py-6 px-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className=" flex justify-center gap-2">
          <div>
            <h2 className="text-2xl font-semibold">Group Data</h2>
          </div>

          <button
            className=" items-center text-white rounded-full font-bold"
            onClick={() => fetchGroupData()}
          >
            <SlRefresh className=" text-black rounded-full text-xl items" />
          </button>
        </div>

        {/* 'Instant Message' Button */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          onClick={openInstantMessage}
        >
          Instant Message
        </button>
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Adjust based on total columns */}
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left px-4 py-2">Select</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Group Name</th>
                <th className="text-center px-4 py-2">User Count</th>
                <th className="text-center px-4 py-2">Time</th>
                <th className="text-center px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((group) => {
                  const { _id: groupId, groupName, users = [], dateCreatedOn } = group;
                  const { formattedDate, time } = formatDateTime(dateCreatedOn);
                  const isSelected = selectedGroupId === groupId;

                  return (
                    <tr
                      key={groupId}
                      className="hover:bg-gray-100 transition duration-200"
                    >
                      <td className="px-4 py-2">
                        <input
                          type="radio"
                          name="groupSelect"
                          value={groupId}
                          checked={isSelected}
                          onChange={() => handleRadioChange(groupId)}
                        />
                      </td>
                      <td className="px-4 py-2">{formattedDate}</td>
                      <td className="px-4 py-2">{groupName || "N/A"}</td>
                      <td className="px-4 py-2 text-center">
                        {formatNumber(users.length)}
                      </td>
                      <td className="px-4 py-2 text-center">{time}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          className={`flex items-center justify-center bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200 ${
                            deletingGroupIds.includes(groupId)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => onDeleteGroup(groupId)}
                          disabled={deletingGroupIds.includes(groupId)}
                          aria-label={`Delete group ${groupName}`}
                        >
                          {deletingGroupIds.includes(groupId) ? (
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              ></path>
                            </svg>
                          ) : (
                            <FaTrashCan />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center px-4 py-2 text-gray-500"
                  >
                    No groups available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Instant Message Popup */}
      <InstantMessage
        isOpen={isInstantMessageOpen}
        onClose={closeInstantMessage}
        groupId={selectedGroupId}
      />
    </div>
  );
};

// Prop type validation
Group.propTypes = {
  groupData: PropTypes.array.isRequired,
  fetchGroupData: PropTypes.func.isRequired,
};

export default Group;
