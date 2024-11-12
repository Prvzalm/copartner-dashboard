// src/components/UserListing.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import CreateGroup from "./CreateGroup"; // Ensure this path is correct
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const UserListing = ({ apDetails }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  /**
   * Maps serviceType values to corresponding strings.
   */
  const mapServiceType = (serviceType) => {
    switch (serviceType) {
      case "1":
        return "Commodity";
      case "2":
        return "Equity";
      case "3":
        return "F&O";
      default:
        return "Unknown";
    }
  };

  /**
   * Logs the combinedUserData for debugging purposes.
   */
  useEffect(() => {
    console.log("UserListing - apDetails prop:", apDetails);
  }, [apDetails]);

  /**
   * Exports the provided data to an Excel file.
   * @param {Array} data - The data to export.
   * @param {string} fileName - The name of the Excel file.
   */
  const exportToExcel = (data, fileName = 'UserData.xlsx') => {
    const exportData = data.map(user => ({
      ID: user.id,
      Name: user.name,
      Mobile: user.mobileNumber,
      KYC: user.isKYC ? 'Yes' : 'No',
      ReferralMode: user.referralMode,
      LandingURL: user.landingPageUrl,
      RAName: user.subscriptions.map(sub => sub.RAname).join(', '),
      Amount: user.subscriptions.map(sub => sub.amount).join(', '),
      SubscriptionName: user.subscriptions.map(sub => sub.planType).join(', '),
      SubscriptionType: user.subscriptions.map(sub => mapServiceType(sub.serviceType)).join(', '),
      CreatedOn: user.createdOn ? new Date(user.createdOn).toLocaleDateString() : 'N/A',
    }));

    // Convert JSON data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
  
    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
  
    // Generate a binary Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // Convert buffer to a Blob and save it
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  };

  /**
   * Flattens the combined user data into a flat list.
   * Each user is followed by their subscriptions as sub rows.
   */
  const flattenedData = useMemo(() => {
    const flatList = [];
    apDetails.forEach((user) => {
      flatList.push({ type: "user", data: user });
      if (user.subscriptions && user.subscriptions.length > 0) {
        user.subscriptions.forEach((sub) => {
          flatList.push({ type: "subscription", data: sub });
        });
      }
    });
    console.log("UserListing - Flattened Data Sample:", flatList.slice(0, 10));
    return flatList;
  }, [apDetails]);

  /**
   * Toggles the selection of an individual user.
   * Only main user rows can be selected.
   */
  const handleCheckboxChange = (user) => {
    console.log("User selected/deselected:", user); // Debugging

    const userExists = selectedUsers.find((u) => u.userId === user.id);

    if (userExists) {
      // Deselect user
      const updatedSelection = selectedUsers.filter((u) => u.userId !== user.id);
      setSelectedUsers(updatedSelection);
      console.log("User deselected:", user.id);
    } else {
      // Select user
      const updatedSelection = [
        ...selectedUsers,
        {
          userId: user.id,
          raNames: user.subscriptions.map((sub) => sub.RAname) || ["N/A"],
          name: user.name || "N/A",
          mobileNumber: user.mobileNumber || "N/A",
        },
      ];
      setSelectedUsers(updatedSelection);
      console.log("User selected:", user.id);
    }
  };

  /**
   * Toggles the selection of all users.
   */
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all users
      setSelectedUsers([]);
      console.log("All users deselected");
    } else {
      // Select all users
      const allUsers = apDetails.map((user) => ({
        userId: user.id,
        raNames: user.subscriptions.map((sub) => sub.RAname) || ["N/A"],
        name: user.name || "N/A",
        mobileNumber: user.mobileNumber || "N/A",
      }));
      setSelectedUsers(allUsers);
      console.log("All users selected");
    }
    setSelectAll(!selectAll);
  };

  /**
   * Keeps the "Select All" checkbox in sync with individual selections.
   */
  useEffect(() => {
    const mainUserCount = apDetails.length;
    const selectedMainUserCount = selectedUsers.length;
    const allSelected = mainUserCount > 0 && selectedMainUserCount === mainUserCount;
    setSelectAll(allSelected);
  }, [selectedUsers, apDetails]);

  /**
   * Row component for react-window virtualization.
   */
  const Row = useCallback(
    ({ index, style }) => {
      const item = flattenedData[index];

      if (item.type === "user") {
        const user = item.data;
        const isSelected = selectedUsers.some((u) => u.userId === user.id);

        return (
          <div
            style={style}
            className={`flex border-b bg-white`}
          >
            {/* Selection Checkbox */}
            <div className="w-1/12 p-2 flex justify-center items-center">
              <input
                type="checkbox"
                onChange={() => handleCheckboxChange(user)}
                checked={isSelected}
              />
            </div>
            {/* Date */}
            <div className="w-2/12 p-2">
              {user.createdOn
                ? new Date(user.createdOn).toLocaleDateString()
                : "N/A"}
            </div>
            {/* Name */}
            <div className="w-2/12 p-2">
              {user.name || "N/A"}
            </div>
            {/* Mobile Number */}
            <div className="w-2/12 p-2">
              {user.mobileNumber || "N/A"}
            </div>
            {/* KYC */}
            <div className="w-1/12 p-2 text-center">
              {user.isKYC ? "Yes" : "No"}
            </div>
            {/* Referral Mode */}
            <div className="w-1/12 p-2">
              {user.referralMode || "N/A"}
            </div>
            {/* Landing URL */}
            <div className="w-1/12 p-2">
              {user.landingPageUrl || "N/A"}
            </div>
            {/* RA Name(s) */}
            <div className="w-2/12 p-2">
              {user.subscriptions.length > 0
                ? user.subscriptions
                    .map((sub) => sub.RAname || "N/A")
                    .join(", ")
                : "N/A"}
            </div>
            {/* Amount(s) */}
            <div className="w-2/12 p-2">
              {user.subscriptions.length > 0
                ? user.subscriptions
                    .map((sub) => (sub.amount ? `₹${sub.amount.toFixed(2)}` : "N/A"))
                    .join(", ")
                : "N/A"}
            </div>
            {/* Subscription Name(s) */}
            <div className="w-2/12 p-2">
              {user.subscriptions.length > 0
                ? user.subscriptions
                    .map((sub) => sub.planType || "N/A")
                    .join(", ")
                : "N/A"}
            </div>
            {/* Subscription Type(s) */}
            <div className="w-2/12 p-2">
              {user.subscriptions.length > 0
                ? user.subscriptions
                    .map((sub) => mapServiceType(sub.serviceType))
                    .join(", ")
                : "N/A"}
            </div>
          </div>
        );
      } else if (item.type === "subscription") {
        const sub = item.data;

        return (
          <div
            style={style}
            className={`flex border-b bg-gray-100`}
          >
            {/* Empty Checkbox Space */}
            <div className="w-1/12 p-2"></div>
            {/* Empty Date Space */}
            <div className="w-2/12 p-2"></div>
            {/* Empty Name Space */}
            <div className="w-2/12 p-2"></div>
            {/* Empty Mobile Number Space */}
            <div className="w-2/12 p-2"></div>
            {/* Empty KYC Space */}
            <div className="w-1/12 p-2 text-center"></div>
            {/* Empty Referral Mode Space */}
            <div className="w-1/12 p-2"></div>
            {/* Empty Landing URL Space */}
            <div className="w-1/12 p-2"></div>
            {/* RA Name */}
            <div className="w-2/12 p-2 pl-6">
              {sub.RAname || "N/A"}
            </div>
            {/* Amount */}
            <div className="w-2/12 p-2 pl-6">
              {sub.amount ? `₹${sub.amount.toFixed(2)}` : "N/A"}
            </div>
            {/* Subscription Name */}
            <div className="w-2/12 p-2 pl-6">
              {sub.planType || "N/A"}
            </div>
            {/* Subscription Type */}
            <div className="w-2/12 p-2 pl-6">
              {mapServiceType(sub.serviceType)}
            </div>
          </div>
        );
      } else {
        return null;
      }
    },
    [flattenedData, selectedUsers, mapServiceType]
  );

  return (
    <div className="py-4 px-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          User Listing
          <span className="ml-2 text-sm font-light">
            ({apDetails.length} total users)
          </span>
        </h2>
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            onClick={() => setShowPopup(true)}
          >
            Create Group
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            onClick={() => exportToExcel(apDetails, 'UserData.xlsx')}
          >
            Download Data
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="flex border-b bg-gray-200">
        <div className="w-1/12 p-2 flex justify-center items-center">
          <input
            type="checkbox"
            onChange={handleSelectAll}
            checked={selectAll}
          />
        </div>
        <div className="w-2/12 p-2 font-bold">Date</div>
        <div className="w-2/12 p-2 font-bold">Name</div>
        
        <div className="w-2/12 p-2 font-bold">Mobile</div>
        <div className="w-1/12 p-2 font-bold text-center">KYC</div>
        <div className="w-1/12 p-2 font-bold">Referral Mode</div>
        <div className="w-1/12 p-2 font-bold">Landing URL</div>
        <div className="w-2/12 p-2 font-bold">RA Name</div>
        <div className="w-2/12 p-2 font-bold">Amount</div>
        <div className="w-2/12 p-2 font-bold">Subscription Name</div>
        <div className="w-2/12 p-2 font-bold">Sub.Type</div>
      </div>

      {/* Virtualized List */}
      <List
        height={600} // Adjust based on your UI needs
        itemCount={flattenedData.length}
        itemSize={50} // Adjust based on row height
        width={"100%"}
      >
        {Row}
      </List>

      {/* Selected Users Count */}
      <div className="mt-4">
        <p>
          Selected Users: <strong>{selectedUsers.length}</strong>
        </p>
      </div>

      {/* Create Group Popup */}
      {showPopup && (
        <CreateGroup
          selectedUsers={selectedUsers}
          closePopup={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default UserListing;
