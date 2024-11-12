import React, { useState, useEffect } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-date-range";

const Registration = ({ searchQuery, onTableData }) => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [count, setCount] = useState(0);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(0); // Track total pages
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false); // Track loading state
  const pageSize = 500; // Set page size to 500

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch(
          `https://copartners.in:5134/api/UserData/UserDataListing?page=${currentPage}&pageSize=${pageSize}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        if (data.isSuccess) {
          setUserData(data.data);
          setCount(data.data.length); // Assuming API provides total count
          setTotalDataCount(data.data[0].totalRows);
          setTotalPages(Math.ceil(data.data[0].totalRows / pageSize)); // Calculate total pages
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUserData();
  }, [currentPage]);

  useEffect(() => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;

    const filteredAndSortedData = userData
      .filter(
        (user) =>
          user.mobile.includes(searchQuery) &&
          (!start ||
            !end ||
            (new Date(user.date) >= start && new Date(user.date) <= end))
      );
    setCount(filteredAndSortedData.length);
    setFilteredData(filteredAndSortedData);
  }, [userData, searchQuery, dateRange]);

  const determineUserType = (userData) => {
    if (userData.apId) {
      return "AP";
    } else if (userData.expertId) {
      return "RA";
    } else {
      return "CP";
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleClearDateRange = () => {
    setDateRange([
      {
        startDate: null,
        endDate: addDays(new Date(), 7),
        key: "selection",
      },
    ]);
  };

  return (
    <div className="py-4 px-8">
      <div className="w-full flex flex-row-reverse">
        <div>Total Count: {totalDataCount}</div>
        <button
          onClick={() => onTableData(filteredData)}
          className="border-2 border-black rounded-lg px-4 py-1 mr-4"
          disabled={loading} // Disable while loading
        >
          Download Sheet
        </button>

        {/* Show "Clear Date Range" button when a range is selected, otherwise show "Select Date Range" */}
        {dateRange[0].startDate ? (
          <button
            onClick={handleClearDateRange}
            className="border-2 border-black rounded-lg px-4 py-1 mr-4"
            disabled={loading} // Disable while loading
          >
            Clear
          </button>
        ) : (
          <button
            onClick={() => setShowDatePicker(true)}
            className="border-2 border-black rounded-lg px-4 py-1 mr-4"
            disabled={loading} // Disable while loading
          >
            Select Date Range
          </button>
        )}
      </div>

      {showDatePicker && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-4 w-11/12 md:w-1/2 lg:w-1/3">
            <h2 className="text-xl font-bold mb-4">Select Date Range</h2>
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDatePicker(false)}
                className="border-2 border-black rounded-lg px-4 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading} // Disable while loading
          className={`border-2 border-black rounded-lg px-4 py-1 ${
            currentPage === 1 || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div>Count: {count}</div>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || loading || count === 0} // Disable while loading
          className={`border-2 border-black rounded-lg px-4 py-1 ${
            currentPage === totalPages || loading || count === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          Next
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-4">Loading...</div> // Show loading indicator
      ) : (
        <table className="table-list w-full mt-4">
          <thead>
            <tr>
              <th className="text-left pl-8">Date</th>
              <th className="text-left pl-8">Time</th>
              <th className="text-left">User Number</th>
              <th className="text-left">Source</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user) => (
              <tr key={user.userId}>
                <td className="text-left pl-8">
                  {new Date(user.date).toLocaleDateString()}
                </td>
                <td className="text-left pl-8">
                  {new Date(user.date).toLocaleTimeString()}
                </td>
                <td className="text-left">{user.mobile}</td>
                <td className="text-left">{determineUserType(user)}</td>
                <td>{user.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading} // Disable while loading
          className={`border-2 border-black rounded-lg px-4 py-1 ${
            currentPage === 1 || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div>Count: {count}</div>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || loading || count === 0} // Disable while loading
          className={`border-2 border-black rounded-lg px-4 py-1 ${
            currentPage === totalPages || loading || count === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Registration;
