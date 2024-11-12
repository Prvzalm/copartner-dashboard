import React, { useState, useEffect } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-date-range";

const MinorSubscription = ({ searchQuery, onTableData }) => {
  const [payments, setPayments] = useState([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false); // Add loading state
  const pageSize = 500;

  // Function to fetch payments
  const fetchPayments = async (page) => {
    setLoading(true); // Set loading to true when starting to fetch data
    const fetchFirstTimePayments = async () => {
      try {
        const res = await fetch(
          `https://copartners.in:5134/api/UserData/UserFirstTimePaymentListing?page=${page}&pageSize=${pageSize}`
        );
        const data = await res.json();
        if (data.isSuccess && data.data.length > 0) {
          return {
            payments: data.data,
            totalRows: data.data[0].totalRows || 0,
          };
        }
        return { payments: [], totalRows: 0 };
      } catch {
        return { payments: [], totalRows: 0 };
      }
    };

    const fetchSecondTimePayments = async () => {
      try {
        const res = await fetch(
          `https://copartners.in:5134/api/UserData/UserSecondTimePaymentListing?page=${page}&pageSize=${pageSize}`
        );
        const data = await res.json();
        if (data.isSuccess && data.data.length > 0) {
          return {
            payments: data.data,
            totalRows: data.data[0].totalRows || 0,
          };
        }
        return { payments: [], totalRows: 0 };
      } catch {
        return { payments: [], totalRows: 0 };
      }
    };

    const firstPaymentsResponse = await fetchFirstTimePayments();
    const secondPaymentsResponse = await fetchSecondTimePayments();

    const combinedPayments = [
      ...firstPaymentsResponse.payments,
      ...secondPaymentsResponse.payments,
    ];

    setPayments(combinedPayments);

    // Calculate total rows as the sum of both APIs
    const totalRowsSum =
      firstPaymentsResponse.totalRows + secondPaymentsResponse.totalRows;
    setTotalRows(totalRowsSum);
    setTotalPages(Math.ceil(totalRowsSum / pageSize));

    setLoading(false); // Set loading to false when done fetching
  };

  useEffect(() => {
    // Fetch payments whenever currentPage changes
    fetchPayments(currentPage);
  }, [currentPage]);

  useEffect(() => {
    // Filter the data based on searchQuery, dateRange, and payments
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;

    const filtered = payments.filter(
      (user) =>
        user.mobile.includes(searchQuery) &&
        user.isSpecialSubscription &&
        (!start || !end || (new Date(user.date) >= start && new Date(user.date) <= end))
    );

    setFilteredData(filtered);
    setCount(filtered.length);
  }, [payments, searchQuery, dateRange]);

  const determineUserType = (userData) => {
    return userData.apId ? "AP" : userData.raId ? "RA" : "CP";
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
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
        <div>Total Count: {totalRows}</div>
        <button
          onClick={() => onTableData(filteredData)}
          className="border-2 border-black rounded-lg px-4 py-1 mr-4"
          disabled={loading} // Disable button when loading
        >
          Download Sheet
        </button>

        {/* Show "Clear" button when a date range is selected, otherwise show "Select Date Range" */}
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
                  {new Date(payment.date).toLocaleDateString()}
                </td>
                <td style={{ textAlign: "left", paddingLeft: "2rem" }}>
                  {new Date(payment.date).toLocaleTimeString()}
                </td>
                <td style={{ textAlign: "left" }}>{payment.mobile}</td>
                <td style={{ textAlign: "left" }}>{determineUserType(payment)}</td>
                <td>{payment.name || "-"}</td>
                <td>{payment.payment}</td>
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

export default MinorSubscription;
