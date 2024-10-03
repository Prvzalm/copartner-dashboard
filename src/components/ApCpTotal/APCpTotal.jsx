import React, { useState, useEffect } from "react";
import PageHeader from "../Header/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main style file
import "react-date-range/dist/theme/default.css"; // Theme css file

const ApCpTotal = () => {
  const [totals, setTotals] = useState({
    totalAPEarning: 0,
    totalRAEarning: 0,
    totalCPEarning: 0,
  });

  const [raData, setRaData] = useState([]);
  const [filteredRaData, setFilteredRaData] = useState([]);
  const [raTotals, setRaTotals] = useState({
    totalUsers: 0,
    totalRaAmount: 0,
    totalCpAmount: 0,
  });

  const [apData, setApData] = useState([]);
  const [filteredApData, setFilteredApData] = useState([]);
  const [apTotals, setApTotals] = useState({
    totalUsers: 0,
    totalApAmount: 0,
    totalCpAmount: 0,
  });

  const [showDatePickerRA, setShowDatePickerRA] = useState(false);
  const [showDatePickerAP, setShowDatePickerAP] = useState(false);
  const [dateRangeRA, setDateRangeRA] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [dateRangeAP, setDateRangeAP] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const [apResponse, raResponse] = await Promise.all([
          fetch(
            "https://copartners.in:5133/api/APDashboard/DashboardAPListing?page=1&pageSize=100000"
          ),
          fetch(
            "https://copartners.in:5132/api/RADashboard/DashboardRAListing?page=1&pageSize=100000"
          ),
        ]);

        if (!apResponse.ok || !raResponse.ok) {
          throw new Error(
            `Something went wrong, AP status: ${apResponse.status}, RA status: ${raResponse.status}`
          );
        }

        const apData = await apResponse.json();
        const raData = await raResponse.json();

        const totalAPEarning = apData.data.reduce(
          (sum, item) => sum + (item.cpEarning || 0),
          0
        );

        const totalRAEarning = apData.data.reduce(
          (sum, item) => sum + (item.raEarning || 0),
          0
        );

        const totalCPEarning = totalAPEarning + totalRAEarning;

        setTotals({
          totalAPEarning,
          totalRAEarning,
          totalCPEarning,
        });

        // Fetch RA names and their respective invoice data
        const updatedRaData = await Promise.all(
          raData.data.map(async (ra) => {
            if (!ra.id) {
              // Skip entries where id is null
              return null;
            }

            const invoiceResponse = await fetch(
              `https://copartners.in:5132/api/RADashboard/GetRAInvoice/${ra.id}?page=1&pageSize=100000`
            );

            if (!invoiceResponse.ok) {
              throw new Error(
                `Failed to fetch invoice data for ${ra.name || "N/A"}: ${invoiceResponse.status}`
              );
            }

            const invoiceData = await invoiceResponse.json();

            // Filter by subscribeDate based on selected date range
            const filteredInvoices = invoiceData.data.filter((invoice) => {
              const subscribeDate = new Date(invoice.subscribeDate).getTime();
              const startDate = dateRangeRA[0].startDate
                ? new Date(dateRangeRA[0].startDate).setHours(0, 0, 0, 0)
                : null;
              const endDate = dateRangeRA[0].endDate
                ? new Date(dateRangeRA[0].endDate).setHours(23, 59, 59, 999)
                : null;

              if (startDate && endDate) {
                return subscribeDate >= startDate && subscribeDate <= endDate;
              }
              return true;
            });

            const totalAmount = filteredInvoices.reduce(
              (sum, invoice) => sum + (invoice.totalAmount || 0),
              0
            );
            const amount = filteredInvoices.reduce(
              (sum, invoice) => sum + (invoice.amount || 0),
              0
            );

            return {
              ...ra,
              totalAmount,
              amount,
              earning: totalAmount - amount, // Correctly calculate earning
              filteredInvoices, // Keep filtered invoices for reference
            };
          })
        );

        setRaData(updatedRaData.filter(Boolean)); // Filter out any null entries
        setFilteredRaData(updatedRaData.filter(Boolean));

        // Calculate totals for the RA Listing table
        const totalUsers = updatedRaData.filter(Boolean).length;
        const totalRaAmount = updatedRaData.reduce(
          (sum, row) => sum + (row ? row.totalAmount : 0),
          0
        );
        const totalCpAmount = updatedRaData.reduce(
          (sum, row) => sum + (row ? row.amount : 0),
          0
        );

        setRaTotals({
          totalUsers,
          totalRaAmount,
          totalCpAmount,
        });

        // Fetch AP names and their respective invoice data
        const updatedApData = await Promise.all(
          apData.data.map(async (ap) => {
            if (!ap.id) {
              // Skip entries where id is null
              return null;
            }

            const invoiceResponse = await fetch(
              `https://copartners.in:5133/api/APDashboard/GetAPInvoice/${ap.id}?page=1&pageSize=100000`
            );

            if (!invoiceResponse.ok) {
              throw new Error(
                `Failed to fetch invoice data for ${ap.apName || "N/A"}: ${invoiceResponse.status}`
              );
            }

            const invoiceData = await invoiceResponse.json();

            // Filter by subscribeDate based on selected date range
            const filteredInvoices = invoiceData.data.filter((invoice) => {
              const subscribeDate = new Date(invoice.subscribeDate).getTime();
              const startDate = dateRangeAP[0].startDate
                ? new Date(dateRangeAP[0].startDate).setHours(0, 0, 0, 0)
                : null;
              const endDate = dateRangeAP[0].endDate
                ? new Date(dateRangeAP[0].endDate).setHours(23, 59, 59, 999)
                : null;

              if (startDate && endDate) {
                return subscribeDate >= startDate && subscribeDate <= endDate;
              }
              return true;
            });

            const totalAmount = filteredInvoices.reduce(
              (sum, invoice) => sum + (invoice.totalAmount || 0),
              0
            );
            const amount = filteredInvoices.reduce(
              (sum, invoice) => sum + (invoice.amount || 0),
              0
            );

            return {
              ...ap,
              totalAmount,
              amount,
              earning: totalAmount - amount, // Correctly calculate earning
              filteredInvoices, // Keep filtered invoices for reference
            };
          })
        );

        setApData(updatedApData.filter(Boolean)); // Filter out any null entries
        setFilteredApData(updatedApData.filter(Boolean));

        // Calculate totals for the AP Listing table
        const totalApUsers = updatedApData.filter(Boolean).length;
        const totalApAmount = updatedApData.reduce(
          (sum, row) => sum + (row ? row.totalAmount : 0),
          0
        );
        const totalApCpAmount = updatedApData.reduce(
          (sum, row) => sum + (row ? row.amount : 0),
          0
        );

        setApTotals({
          totalUsers: totalApUsers,
          totalApAmount,
          totalCpAmount: totalApCpAmount,
        });
      } catch (error) {
        toast.error(`Failed to fetch data: ${error.message}`);
      }
    };

    fetchEarnings();
  }, [dateRangeRA, dateRangeAP]);

  const handleClearFilterRA = () => {
    setDateRangeRA([{ startDate: null, endDate: null, key: "selection" }]);
    setFilteredRaData(raData); // Reset to show all data without date filtering
  };

  const handleClearFilterAP = () => {
    setDateRangeAP([{ startDate: null, endDate: null, key: "selection" }]);
    setFilteredApData(apData); // Reset to show all data without date filtering
  };

  const formatSelectedDateRange = (dateRange) => {
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

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="Earnings"
        searchQuery=""
        setSearchQuery={() => {}}
        hasNotification={false}
        setHasNotification={() => {}}
      />

      <div className="p-4">
        {/* AP and CP Earnings Table */}
        <div className="dashboard-view-section mb-4">
          <div className="table-list-mb">
            <div className="py-4 px-8">
              <table className="table-list">
                <thead>
                  <tr>
                    <th>RA Earnings</th>
                    <th>AP Earnings</th>
                    <th>CP Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-100">
                    <td className="text-blue-600 font-bold">
                      {totals.totalRAEarning.toFixed(2)}
                    </td>
                    <td className="text-blue-600 font-bold">
                      {totals.totalAPEarning.toFixed(2)}
                    </td>
                    <td className="text-green-600 font-bold">
                      {totals.totalCPEarning.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RA Listing Table */}
        <div className="p-4">
          <div className="dashboard-view-section mb-4">
            <div className="mb-4">
              <div className="channel-heading">
                <h3 className="text-xl font-semibold">R.A. Earning Listing</h3>
              </div>
            </div>
            <div className="table-list-mb">
              <div className="flex justify-end space-x-4 items-center mb-4">
                <button
                  onClick={() => setShowDatePickerRA(true)}
                  className="border-2 border-black rounded-lg px-4 py-1"
                >
                  {formatSelectedDateRange(dateRangeRA)}
                </button>
                <button
                  onClick={handleClearFilterRA}
                  className="border-2 border-red-500 rounded-lg px-4 py-1 text-red-500"
                >
                  Clear Filter
                </button>
              </div>

              <div className="py-4 px-8">
                <table className="table-list">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", paddingLeft: "2rem" }}>
                        R.A. Name
                      </th>
                      <th>Total Amount</th>
                      <th>Amount</th>
                      <th className="filter-header">Earning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRaData.map((row, index) => (
                      <tr
                        key={index}
                        className="even:bg-gray-100 odd:bg-white"
                      >
                        <td style={{ textAlign: "left", paddingLeft: "2rem" }}>
                          <Link to={`/r.a/${row.id}`}>
                            {row.name || "N/A"}
                          </Link>
                        </td>
                        <td className="text-blue-600">
                          {(row.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="text-red-500">
                          {(row.amount || 0).toFixed(2)}
                        </td>
                        <td className="text-green-600">
                          {(row.earning || 0).toFixed(2)}
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
                      >
                        {raTotals.totalRaAmount.toFixed(2)}
                      </td>
                      <td
                        style={{ fontWeight: "bold" }}
                        className="text-red-500"
                      >
                        {raTotals.totalCpAmount.toFixed(2)}
                      </td>
                      <td
                        style={{ fontWeight: "bold" }}
                        className="text-green-600"
                      >
                        {(
                          raTotals.totalRaAmount - raTotals.totalCpAmount
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* AP Listing Table */}
        <div className="p-4">
          <div className="dashboard-view-section mb-4">
            <div className="mb-4">
              <div className="channel-heading">
                <h3 className="text-xl font-semibold">A.P. Earning Listing</h3>
              </div>
            </div>
            <div className="table-list-mb">
              <div className="flex justify-end space-x-4 items-center mb-4">
                <button
                  onClick={() => setShowDatePickerAP(true)}
                  className="border-2 border-black rounded-lg px-4 py-1"
                >
                  {formatSelectedDateRange(dateRangeAP)}
                </button>
                <button
                  onClick={handleClearFilterAP}
                  className="border-2 border-red-500 rounded-lg px-4 py-1 text-red-500"
                >
                  Clear Filter
                </button>
              </div>

              <div className="py-4 px-8">
                <table className="table-list">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", paddingLeft: "2rem" }}>
                        A.P. Name
                      </th>
                      <th>Total Amount</th>
                      <th>Amount</th>
                      <th className="filter-header">Earning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApData.map((row, index) => (
                      <tr
                        key={index}
                        className="even:bg-gray-100 odd:bg-white"
                      >
                        <td style={{ textAlign: "left", paddingLeft: "2rem" }}>
                          <Link to={`/a.p/${row.id}`}>
                            {row.apName || "N/A"}
                          </Link>
                        </td>
                        <td className="text-blue-600">
                          {(row.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="text-red-500">
                          {(row.amount || 0).toFixed(2)}
                        </td>
                        <td className="text-green-600">
                          {(row.earning || 0).toFixed(2)}
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
                      >
                        {apTotals.totalApAmount.toFixed(2)}
                      </td>
                      <td
                        style={{ fontWeight: "bold" }}
                        className="text-red-500"
                      >
                        {apTotals.totalCpAmount.toFixed(2)}
                      </td>
                      <td
                        style={{ fontWeight: "bold" }}
                        className="text-green-600"
                      >
                        {(
                          apTotals.totalApAmount - apTotals.totalCpAmount
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Modals */}
      {showDatePickerRA && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-4 w-11/12 md:w-1/2 lg:w-1/3">
            <h2 className="text-xl font-bold mb-4">Select Date Range</h2>
            <DateRangePicker
              onChange={(item) => setDateRangeRA([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRangeRA}
              editableDateInputs={true}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDatePickerRA(false)}
                className="border-2 border-black rounded-lg px-4 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDatePickerAP && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-4 w-11/12 md:w-1/2 lg:w-1/3">
            <h2 className="text-xl font-bold mb-4">Select Date Range</h2>
            <DateRangePicker
              onChange={(item) => setDateRangeAP([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRangeAP}
              editableDateInputs={true}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDatePickerAP(false)}
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

export default ApCpTotal;
