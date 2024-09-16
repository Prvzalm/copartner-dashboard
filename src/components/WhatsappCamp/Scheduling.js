import React, { useState } from "react";

const Scheduling = ({ groupData = [] }) => {
  // Pagination state
  const rowsPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);

  // Ensure groupData is an array and access the actual data array
  const validGroupData = Array.isArray(groupData) ? groupData : [];

  // Group the users by groupName
  const groupedData = validGroupData.reduce((acc, user) => {
    if (!acc[user.groupName]) {
      acc[user.groupName] = [];
    }
    acc[user.groupName].push(user);
    return acc;
  }, {});

  // Convert grouped data into an array
  const groupedArray = Object.entries(groupedData);

  // Calculate the total number of pages
  const totalPages = Math.ceil(groupedArray.length / rowsPerPage);

  // Get the data for the current page
  const currentData = groupedArray.slice(
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

  return (
    <div className="py-4 px-8">
      <div className="table-container overflow-x-auto">
        <h2 className="pl-3 text-xl font-semibold">Schedule Listing</h2>
        <div className="flex justify-end space-x-4">
         
          <button className="border rounded-lg border-black p-2">
            + Add
          </button>
         
        </div>

        <table className="table-list min-w-max mt-4">
          <thead>
            <tr className="requestColumns">
              <th style={{ textAlign: "left", paddingLeft: "2rem" }}>Date</th>
              <th style={{ textAlign: "left" }}>Group Name</th>
              <th>Scheduling Time</th>
              <th>Campaign Temp.</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 &&
              currentData.map(([groupName, users]) => {
                return (
                  <tr key={groupName} className="request-numbers font-semibold">
                    <td style={{ textAlign: "left", paddingLeft: "2rem" }} className="p-3">
                      {new Date().toLocaleDateString()} {/* Show today's date */}
                    </td>
                    <td style={{ textAlign: "left" }} className="p-3">
                      {groupName || "N/A"}
                    </td>
                    <td className="p-3">{formatNumber(users.length)}</td> {/* Display correct user count */}
                    <td className="p-3">{new Date().toLocaleTimeString()}</td> {/* Show current time */}
                    <td className="p-3">
                      <button className="btn btn-primary">Action</button>
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

export default Scheduling;
