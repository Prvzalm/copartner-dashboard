import React, { useState, useEffect } from "react";
import axios from "axios";
import { DateRange } from "react-date-range";

const AppSubscription = () => {
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 500;

  const totalRows = filteredData.length;

  const fetchData = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://copartners.in:5009/api/Subscriber?plateform=App&page=${page}&pageSize=${pageSize}`
      );
      if (response.data.isSuccess) {
        const data = response.data.data;
        setFilteredData(data);
        setCount(data.length);
        setTotalPages(1); // Assuming 1 page, you can adjust if pagination is involved

        // Fetch user names for each userId
        const userIds = data.map((item) => item.userId);
        const userDetails = await fetchUserDetails(userIds);
        setUserInfo(userDetails);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  // Fetch user details for each userId
  const fetchUserDetails = async (userIds) => {
    const userDetails = {};
    for (const userId of userIds) {
      try {
        const response = await axios.get(
          `https://copartners.in:5131/api/User/${userId}`
        );
        if (response.data.isSuccess) {
          userDetails[userId] = {
            name: response.data.data.name,
            mobileNumber: response.data.data.mobileNumber,
            referralMode: response.data.data.referralMode,
          };
        } else {
          userDetails[userId] = { name: "Unknown User", mobileNumber: "N/A" }; // Fallback if no user is found
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        userDetails[userId] = { name: "Unknown User", mobileNumber: "N/A" }; // Fallback if an error occurs
      }
    }
    return userDetails;
  };

  // Handle Date Range Clear
  const handleClearDateRange = () => {
    setDateRange([
      {
        startDate: null,
        endDate: null,
        key: "selection",
      },
    ]);
  };

  // Handle page navigation
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="py-4 px-8">
      <div className="w-full flex flex-row-reverse">
        <div>Total Count: {totalRows}</div>
        <button
          onClick={() => {}}
          className="border-2 border-black rounded-lg px-4 py-1 mr-4"
          disabled={loading}
        >
          Download Sheet
        </button>

        {dateRange[0].startDate ? (
          <button
            onClick={handleClearDateRange}
            className="border-2 border-black rounded-lg px-4 py-1 mr-4"
            disabled={loading}
          >
            Clear
          </button>
        ) : (
          <button
            onClick={() => setShowDatePicker(true)}
            className="border-2 border-black rounded-lg px-4 py-1 mr-4"
            disabled={loading}
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

      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1 || loading}
          className={`border-2 border-black rounded-lg px-4 py-1 ${
            currentPage === 1 || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div>Count: {count}</div>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || loading || count === 0}
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
        <div className="text-center">Loading...</div>
      ) : (
        <table className="table-list">
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingLeft: "2rem" }}>Date</th>
              <th style={{ textAlign: "left", paddingLeft: "2rem" }}>Time</th>
              <th style={{ textAlign: "left" }}>User Number</th>
              <th style={{ textAlign: "left" }}>Source</th>
              <th>Name</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((payment) => (
              <tr key={payment.userId}>
                <td style={{ textAlign: "left", paddingLeft: "2rem" }}>
                  {new Date(payment.transactionDate).toLocaleDateString()}
                </td>
                <td style={{ textAlign: "left", paddingLeft: "2rem" }}>
                  {new Date(payment.transactionDate).toLocaleTimeString()}
                </td>
                <td style={{ textAlign: "left" }}>
                  {userInfo[payment.userId]?.mobileNumber || "-"}
                </td>
                <td style={{ textAlign: "left" }}>
                  {userInfo[payment.userId]?.referralMode || "-"}
                </td>
                <td>{userInfo[payment.userId]?.name || "-"}</td>{" "}
                {/* Displaying user name */}
                <td>{payment.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1 || loading}
          className={`border-2 border-black rounded-lg px-4 py-1 ${
            currentPage === 1 || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div>Count: {count}</div>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || loading || count === 0}
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

export default AppSubscription;
