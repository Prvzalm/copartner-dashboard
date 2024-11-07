import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../Header/Header";
import "./RAPage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const RAPage = () => {
  const [expertsData, setExpertsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalUsersPaid: 0,
    totalTurnover: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [hasNotification, setHasNotification] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredExpertsData, setFilteredExpertsData] = useState([]);

  useEffect(() => {
    const fetchRAData = async () => {
      try {
        const response = await fetch(
          "https://copartners.in:5132/api/RADashboard/DashboardRAListing?page=1&pageSize=100000"
        );
        if (!response.ok) {
          throw new Error("Something went wrong, status " + response.status);
        }
        const data = await response.json();
        setFilteredData(data.data); // Set initially filtered data to all data
      } catch (error) {
        toast.error(`Failed to fetch data: ${error.message}`);
      }
    };

    const fetchExpertsData = async () => {
      try {
        const expertsResponse = await fetch(
          "https://copartners.in:5132/api/Experts?page=1&pageSize=100000"
        );
        if (!expertsResponse.ok) {
          throw new Error(`Failed to fetch experts: ${expertsResponse.status}`);
        }
        const expertsData = await expertsResponse.json();
        const expertsList = expertsData.data;

        const updatedExpertsData = await Promise.all(
          expertsList.map(async (expert) => {
            const raInvoiceResponse = await fetch(
              `https://copartners.in:5132/api/RADashboard/GetRAInvoice/${expert.id}?page=1&pageSize=100000`
            );
            if (!raInvoiceResponse.ok) {
              throw new Error(
                `Failed to fetch invoice data for ${expert.name}: ${raInvoiceResponse.status}`
              );
            }
            const raInvoiceData = await raInvoiceResponse.json();
            const invoices = raInvoiceData.data;

            const usersPaid = invoices.reduce(
              (sum, invoice) => sum + (invoice.totalAmount || 0),
              0
            );

            return {
              ...expert,
              usersPaid,
              invoices, // Add the invoices to the expert data for filtering
            };
          })
        );

        setExpertsData(updatedExpertsData);
        setFilteredExpertsData(updatedExpertsData); // Initially show all data
        calculateTotalTurnover(updatedExpertsData); // Calculate total turnover from the start till now
        setLoading(false);
      } catch (error) {
        toast.error(`Error fetching data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchRAData();
    fetchExpertsData();
  }, []);

  useEffect(() => {
    if (dateRange[0].startDate || dateRange[0].endDate) {
      const startDate = dateRange[0].startDate
        ? new Date(dateRange[0].startDate).setHours(0, 0, 0, 0)
        : null;
      const endDate = dateRange[0].endDate
        ? new Date(dateRange[0].endDate).setHours(23, 59, 59, 999)
        : null;

      const filteredTurnover = expertsData.map((expert) => {
        const filteredInvoices = expert.invoices.filter((invoice) => {
          const date = new Date(invoice.subscribeDate).getTime();
          if (startDate && endDate) {
            return date >= startDate && date <= endDate;
          }
          return true;
        });

        const turnover = filteredInvoices.reduce(
          (sum, invoice) => sum + (parseFloat(invoice.totalAmount) || 0),
          0
        );

        return {
          ...expert,
          turnover: turnover.toFixed(2),
          filteredInvoices,
        };
      });

      setFilteredExpertsData(filteredTurnover);

      const totalTurnover = filteredTurnover.reduce(
        (sum, expert) => sum + parseFloat(expert.turnover),
        0
      );
      setTotals({ totalTurnover: totalTurnover.toFixed(2) });
    } else {
      calculateTotalTurnover(expertsData); // Calculate the total turnover from the start till now when no date filter is applied
    }
  }, [dateRange, expertsData]);

  // Function to calculate total turnover from the start till now
  const calculateTotalTurnover = (experts) => {
    const totalTurnover = experts.reduce(
      (sum, expert) =>
        sum +
        expert.invoices.reduce(
          (invoiceSum, invoice) =>
            invoiceSum + (parseFloat(invoice.totalAmount) || 0),
          0
        ),
      0
    );
    setTotals({ totalTurnover: totalTurnover.toFixed(2) });
    setFilteredExpertsData(experts);
  };

  // Function to calculate the turnover for each RA individually, considering the selected date range
  const calculateIndividualTurnover = (invoices) => {
    if (dateRange[0].startDate || dateRange[0].endDate) {
      const startDate = dateRange[0].startDate
        ? new Date(dateRange[0].startDate).setHours(0, 0, 0, 0)
        : null;
      const endDate = dateRange[0].endDate
        ? new Date(dateRange[0].endDate).setHours(23, 59, 59, 999)
        : null;

      const filteredInvoices = invoices.filter((invoice) => {
        const date = new Date(invoice.subscribeDate).getTime();
        if (startDate && endDate) {
          return date >= startDate && date <= endDate;
        }
        return true;
      });

      return filteredInvoices.reduce(
        (sum, invoice) => sum + (parseFloat(invoice.totalAmount) || 0),
        0
      );
    }

    return invoices.reduce(
      (sum, invoice) => sum + (parseFloat(invoice.totalAmount) || 0),
      0
    );
  };

  // Function to clear the date filter
  const clearDateFilter = () => {
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    calculateTotalTurnover(expertsData); // Reset to show the total amount from start till now
  };

  // Function to format the selected date range for display
  const formatSelectedDateRange = () => {
    if (dateRange[0].startDate && dateRange[0].endDate) {
      const startDate = dateRange[0].startDate.toLocaleDateString();
      const endDate = dateRange[0].endDate.toLocaleDateString();
      return `${startDate} - ${endDate}`;
    } else if (dateRange[0].startDate || dateRange[0].endDate) {
      const date =
        (dateRange[0].startDate || dateRange[0].endDate).toLocaleDateString();
      return `${date}`;
    }
    return "Select Date Range";
  };

  const totalUsersCount = filteredData.reduce(
    (sum, row) => sum + row.usersCount,
    0
  );
  const totalRaEarning = filteredData.reduce(
    (sum, row) => sum + row.raEarning,
    0
  );
  const totalCpEarning = filteredData.reduce(
    (sum, row) => sum + row.cpEarning,
    0
  );

  const totalFilteredUsersPaid = filteredExpertsData.reduce(
    (sum, expert) => sum + expert.usersPaid,
    0
  );
  const totalFilteredTurnover = filteredExpertsData.reduce(
    (sum, expert) => sum + parseFloat(expert.turnover),
    0
  );

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="R.A"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasNotification={hasNotification}
        setHasNotification={setHasNotification}
      />

      <div className="p-4">
        <div className="dashboard-view-section mb-4">
          <div className=" mb-4">
            <div className="channel-heading">
              <h3 className="text-xl font-semibold">Listing</h3>
            </div>
          </div>
          <div className="table-list-mb">
            <div className="py-4 px-8">
              <table className="table-list">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", paddingLeft: "2rem" }}>
                      R.A. Name
                    </th>
                    <th>Users</th>
                    <th>Spend on R.A</th>
                    <th className="filter-header">Earning</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr
                      key={index}
                      className="even:bg-gray-100 odd:bg-white"
                    >
                      <td style={{ textAlign: "left", paddingLeft: "2rem" }}>
                        <Link to={`/r.a/${row.id}`}>{row.name}</Link>
                      </td>
                      <td className="text-blue-600">
                        <Link to={`/r.a/${row.id}`}>{row.usersCount}</Link>
                      </td>
                      <td className="text-red-500">{row.raEarning}</td>
                      <td className="text-green-600">{row.cpEarning}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td
                      style={{
                        textAlign: "left",
                        paddingLeft: "2rem",
                        fontWeight: "bold",
                      }}
                    >
                      Total
                    </td>
                    <td
                      style={{ fontWeight: "bold" }}
                      className="text-blue-600"
                    >
                      {totalUsersCount}
                    </td>
                    <td
                      style={{ fontWeight: "bold" }}
                      className="text-red-500"
                    >
                      {totalRaEarning.toFixed(1)}
                    </td>
                    <td
                      style={{ fontWeight: "bold" }}
                      className="text-green-600"
                    >
                      {totalCpEarning.toFixed(1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="dashboard-view-section mb-4">
          <div className="table-list-mb ">
            <div className="bg-[#e5e5e5] p-4 text-base items-center rounded-t-[10px] flex justify-between">
              <h3 className="text-xl flex font-semibold">TurnOver</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="border-2 border-black rounded-lg px-4 py-1"
                >
                  {formatSelectedDateRange()}
                </button>
                <button
                  onClick={clearDateFilter}
                  className="border-2 border-red-500 rounded-lg px-4 py-1 text-red-500"
                >
                  Clear Filter
                </button>
              </div>
            </div>

            <div className="py-4 px-8">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="table-list">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", paddingLeft: "2rem" }}>
                        R.A. Name
                      </th>
                      <th></th>
                      <th className="filter-header">TurnOver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpertsData.map((expert, index) => (
                      <tr
                        key={index}
                        className="even:bg-gray-100 odd:bg-white"
                      >
                        <td
                          style={{ textAlign: "left", paddingLeft: "2rem" }}
                        >
                          <Link to={`/r.a/${expert.id}`}>{expert.name}</Link>
                        </td>
                        <td className="text-red-500"></td>
                        <td className="text-green-600">
                          {calculateIndividualTurnover(
                            expert.invoices
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100">
                      <td
                        style={{
                          textAlign: "left",
                          paddingLeft: "2rem",
                          fontWeight: "bold",
                        }}
                      >
                        Total
                      </td>
                      <td
                        style={{ fontWeight: "bold" }}
                        className="text-blue-600"
                      ></td>
                      <td
                        style={{ fontWeight: "bold" }}
                        className="text-green-600"
                      >
                        {totals.totalTurnover}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
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

      <ToastContainer />
    </div>
  );
};

export default RAPage;
