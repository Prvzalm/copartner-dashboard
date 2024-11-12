// src/components/WhatsappCamp.jsx
import React, { useState, useEffect, useMemo } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserListing from "./UserListing";
import Group from "./Group"; // Ensure this component exists
import Filter from "./Filter"; // Ensure this component exists
import Scheduling from "./Scheduling"; // Ensure this component exists
import Campaign from "./Campaign"; // Ensure this component exists
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const WhatsappCamp = () => {
  const navigate = useNavigate();

  // State variables
  const [apDetails, setApDetails] = useState([]); // Users from User API
  const [groupData, setGroupData] = useState([]); // Groups data
  const [schedulingData, setSchedulingData] = useState([]); // Scheduling data
  const [templateData, setTemplateData] = useState([]); // Template data
  const [userDetails, setUserDetails] = useState([]); // Subscriptions per user
  const [currentView, setCurrentView] = useState("UserListing"); // Current active view
  const [filterVisible, setFilterVisible] = useState(false); // Filter modal visibility
  const [filters, setFilters] = useState(null); // Active filters
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  /**
   * Fetches all users from the User API with pagination.
   * Returns the fetched users.
   */
  const fetchAllUsers = async () => {
    let allUsers = [];
    let page = 1;
    const pageSize = 10000; // Adjust based on API limits
    let hasMore = true;

    while (hasMore) {
      try {
        console.log(`Fetching users from page ${page}`);
        const response = await fetch(
          `https://copartners.in:5131/api/User?page=${page}&pageSize=${pageSize}`
          // Include headers if authentication is required
          // {
          //   headers: {
          //     Authorization: `Bearer YOUR_ACCESS_TOKEN`,
          //     // ...other headers
          //   },
          // }
        );

        console.log(`User API Response Status for page ${page}:`, response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user data on page ${page}: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(`Fetched ${data.data.length} users from page ${page}`);

        if (data.isSuccess && Array.isArray(data.data) && data.data.length > 0) {
          allUsers = [...allUsers, ...data.data];
          // Check if more pages exist
          if (data.data.length < pageSize) {
            hasMore = false;
          } else {
            page += 1;
          }
        } else {
          console.log(`No more users to fetch on page ${page}`);
          hasMore = false;
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error(`Failed to fetch user data: ${error.message}`);
        hasMore = false;
      }
    }

    setApDetails(allUsers);
    console.log(`Total Users Fetched: ${allUsers.length}`);
    return allUsers; // Return fetched users
  };

  /**
   * Fetches subscription data for the provided users.
   * @param {Array} users - List of user objects to fetch subscriptions for.
   */
  const fetchAllSubscriptions = async (users) => {
    if (users.length === 0) {
      console.log("No users to fetch subscriptions for.");
      return;
    }

    console.log(`Fetching subscriptions for ${users.length} users...`);

    const userIds = users.map((user) => user.id);
    const batchSize = 50; // Adjust based on API rate limits
    const batches = [];

    // Create batches of userIds
    for (let i = 0; i < userIds.length; i += batchSize) {
      batches.push(userIds.slice(i, i + batchSize));
    }

    let allSubscriptions = [];

    // Fetch subscriptions for each batch sequentially
    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing batch ${batchIndex + 1} with ${batch.length} users`);

      const promises = batch.map(async (userId) => {
        try {
          console.log(`Fetching subscription data for userId: ${userId}`);
          const response = await fetch(
            `https://copartners.in:5009/api/Subscriber/GetByUserId/${userId}`
          
          );

          console.log(`Subscription API Status for user ${userId}:`, response.status);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch subscriber data for user ${userId}: ${response.statusText}`
            );
          }

          const subscriberData = await response.json();
          console.log(`Subscription API Response for user ${userId}:`, subscriberData);

          if (subscriberData.isSuccess && Array.isArray(subscriberData.data)) {
            const mappedSubscriptions = subscriberData.data.map((sub) => ({
              amount: sub?.totalAmount || 0,
              RAname: sub?.subscription?.experts?.name
                ? sub.subscription.experts.name.trim()
                : "N/A",
              planType: sub?.subscription?.planType
                ? sub.subscription.planType.trim()
                : "N/A",
              serviceType: sub?.subscription?.serviceType
                ? sub.subscription.serviceType.trim()
                : "N/A",
            }));

            console.log(
              `User ${userId} has ${mappedSubscriptions.length} subscriptions:`,
              mappedSubscriptions
            );
            return {
              userId,
              subscriptions: mappedSubscriptions,
            };
          } else {
            console.log(`User ${userId} has no subscriptions or API returned failure`);
            return { userId, subscriptions: [] };
          }
        } catch (error) {
          console.error(`Error fetching subscriber data for user ${userId}:`, error);
          return { userId, subscriptions: [] };
        }
      });

      // Await all promises in the current batch
      const results = await Promise.all(promises);
      allSubscriptions = [...allSubscriptions, ...results];
      console.log(`Completed batch ${batchIndex + 1}`);
    }

    setUserDetails(allSubscriptions);
    console.log("Fetched all subscriptions:", allSubscriptions.length);

    // Check for any missing subscriptions
    const missingSubscriptions = users.filter(
      (user) => !allSubscriptions.some((detail) => detail.userId === user.id)
    );
    if (missingSubscriptions.length > 0) {
      console.warn(`Missing subscriptions for ${missingSubscriptions.length} users.`);
    }
  };

  /**
   * Fetches group data.
   */
  const fetchGroupData = async () => {
    try {
      console.log("Fetching group data...");
      const response = await fetch(`https://whatsapp.copartner.in/api/groups`);

      console.log(`Group API Response Status:`, response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch group data");
      }

      const data = await response.json();
      console.log("Fetched Group Data:", data);
      setGroupData(data); // Assuming data is an array of groups
    } catch (error) {
      console.error("Error fetching group data:", error);
      toast.error(`Failed to fetch group data: ${error.message}`);
    }
  };

  /**
   * Fetches scheduling data.
   */
  const fetchSchedulingData = async () => {
    try {
      console.log("Fetching scheduling data...");
      const response = await fetch(`https://whatsapp.copartner.in/api/schedule`);
      console.log(`Scheduling API Response Status:`, response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch scheduling data");
      }

      const data = await response.json();
      console.log("Fetched Scheduling Data:", data);
      setSchedulingData(data); // Assuming data is an array of schedules
    } catch (error) {
      console.error("Error fetching scheduling data:", error);
      toast.error(`Failed to fetch scheduling data: ${error.message}`);
    }
  };

  /**
   * Fetches template data.
   */
  const fetchTemplateData = async () => {
    try {
      console.log("Fetching template data...");
      const response = await fetch(`https://whatsapp.copartner.in/api/templates`);
      console.log(`Template API Response Status:`, response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch template data");
      }

      const data = await response.json();
      console.log("Fetched Template Data:", data);
      setTemplateData(data); // Assuming data is an array of templates
    } catch (error) {
      console.error("Error fetching template data:", error);
      toast.error(`Failed to fetch template data: ${error.message}`);
    }
  };

  /**
   * useEffect hook to fetch all necessary data on component mount.
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const users = await fetchAllUsers();
        await fetchAllSubscriptions(users);
        await fetchGroupData();
        await fetchSchedulingData();
        await fetchTemplateData();
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Combines user data with their corresponding subscriptions.
   */
  const combinedUserData = useMemo(() => {
    const combined = apDetails.map((user) => {
      const additionalData =
        userDetails.find((detail) => detail.userId === user.id) || {
          subscriptions: [],
        };
      return {
        ...user,
        subscriptions: additionalData.subscriptions,
      };
    });
    console.log("Combined User Data Sample:", combined.slice(0, 5)); // Log first 5 users for verification

    // Specific user check (e.g., with RAname 'BIBHAV NAYAK')
    const specificUser = combined.find((user) =>
      user.subscriptions.some((sub) => sub.RAname.toLowerCase() === "bibhav nayak")
    );
    console.log("Specific User with RAname 'BIBHAV NAYAK':", specificUser);

    return combined;
  }, [apDetails, userDetails]);

  /**
   * Applies the selected filters.
   */
  const applyFilter = (filterCriteria) => {
    setFilters(filterCriteria);
    setFilterVisible(false);
    console.log("Filters applied:", filterCriteria);
  };

  /**
   * Clears all active filters.
   */
  const clearFilter = () => {
    setFilters(null);
    setFilterVisible(false);
    console.log("Filters cleared.");
  };

  /**
   * Normalizes text for consistent comparison.
   */
  const normalizeText = (text) => (text ? text.trim().toLowerCase() : "n/a");

  /**
   * Filtering logic that processes all subscriptions for each user.
   */
  // const exportToExcel = (data, fileName = 'data.xlsx') => {
  //   // Convert JSON data to a worksheet
  //   const worksheet = XLSX.utils.json_to_sheet(data);
  
  //   // Create a workbook and append the worksheet
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  //   // Generate a binary Excel file
  //   const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  //   // Convert buffer to a Blob and save it
  //   const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //   saveAs(blob, fileName);
  // };
  const filteredUserData = useMemo(() => {
    if (!filters) return combinedUserData;

    // filtering data to be saved on excel sheet 
    



    const {
      selectedKYC,
      selectedReferralMode,
      selectedLandingUrl,
      selectedSubscription,
      selectedSubscriptionType,
      selectedRAName,
      amountRange,
      selectedAmount,
      selectedGroup,
      startDate,
      endDate,
    } = filters;

    return combinedUserData.filter((user) => {
      // KYC Filter
      const userKYCStatus = user.isKYC ? "yes" : "no";
      if (selectedKYC.length > 0 && !selectedKYC.includes(userKYCStatus)) {
        return false;
      }

      // Referral Mode Filter
      if (
        selectedReferralMode.length > 0 &&
        !selectedReferralMode.includes(normalizeText(user.referralMode))
      ) {
        return false;
      }

      // Landing URL Filter
      if (
        selectedLandingUrl.length > 0 &&
        !selectedLandingUrl.includes(normalizeText(user.landingPageUrl))
      ) {
        return false;
      }

      // Subscription Filter
      if (selectedSubscription.length > 0) {
        const userSubscriptions = user.subscriptions.map((sub) =>
          normalizeText(sub.planType)
        );
        if (!selectedSubscription.some((sub) => userSubscriptions.includes(sub))) {
          return false;
        }
      }

      // Subscription Type Filter
      if (selectedSubscriptionType.length > 0) {
        const userSubscriptionTypes = user.subscriptions.map((sub) =>
          normalizeText(sub.serviceType)
        );
        if (
          !selectedSubscriptionType.some((type) =>
            userSubscriptionTypes.includes(type)
          )
        ) {
          return false;
        }
      }

      // RA Name Filter
      if (selectedRAName.length > 0) {
        const userRANames = user.subscriptions.map((sub) =>
          normalizeText(sub.RAname)
        );
        if (!selectedRAName.some((name) => userRANames.includes(name))) {
          return false;
        }
      }

      // Amount Filter (Number of Payments)
      if (selectedAmount.length > 0) {
        const paymentsCount = user.subscriptions.length;
        const hasOnePayment =
          selectedAmount.includes("one") && paymentsCount === 1;
        const hasMoreThanOnePayment =
          selectedAmount.includes("more than one") && paymentsCount > 1;

        if (!hasOnePayment && !hasMoreThanOnePayment) {
          return false;
        }
      }

      // Amount Range Filter
      if (amountRange.start !== "" || amountRange.end !== "") {
        const totalAmount = user.subscriptions.reduce(
          (sum, sub) => sum + (sub.amount || 0),
          0
        );
        if (
          amountRange.start !== "" &&
          totalAmount < parseFloat(amountRange.start)
        ) {
          return false;
        }
        if (
          amountRange.end !== "" &&
          totalAmount > parseFloat(amountRange.end)
        ) {
          return false;
        }
      }

      // Group Filter
      if (selectedGroup.length > 0) {
        if (!selectedGroup.includes(normalizeText(user.groupName))) {
          return false;
        }
      }

      // Date Range Filter
      if (startDate || endDate) {
        const userDate = new Date(user.createdOn);
        if (startDate && userDate < new Date(startDate)) {
          return false;
        }
        if (endDate && userDate > new Date(endDate)) {
          return false;
        }
      }

      // If all filters pass
      return true;
    });
  }, [filters, combinedUserData]);

  /**
   * Logs active filters and the count of filtered users for debugging.
   */
  useEffect(() => {
    if (filters) {
      console.log("Active Filters:", filters);
      console.log("Filtered User Data Count:", filteredUserData.length);
      // Uncomment the line below to see all filtered users
      // console.log("Filtered Users:", filteredUserData);
    }
  }, [filters, filteredUserData]);

  /**
   * Handles search functionality.
   * Filters users based on the search query matching name or mobile number.
   */
  const searchedUserData = useMemo(() => {
    if (!searchQuery) return filteredUserData;

    const lowerCaseQuery = searchQuery.toLowerCase();

    return filteredUserData.filter(
      (user) =>
        (user.name && user.name.toLowerCase().includes(lowerCaseQuery)) ||
        (user.mobileNumber &&
          user.mobileNumber.toLowerCase().includes(lowerCaseQuery))
    );
  }, [searchQuery, filteredUserData]);

  /**
   * Renders the content based on the current view.
   */
  const renderContent = () => {
    switch (currentView) {
      case "UserListing":
        return <UserListing apDetails={searchedUserData} />;
      case "Group":
        return <Group groupData={groupData} fetchGroupData={fetchGroupData} />;
      case "Scheduling":
        return <Scheduling schedulingData={schedulingData} />;
      case "Campaign":
        return (
          <Campaign
            templateData={templateData}
            fetchTemplateData={fetchTemplateData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      {/* Custom Page Header */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Whatsapp Campaign</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or mobile..."
            className="p-2 border border-gray-300 rounded-md"
          />
          {/* Notification Badge (Optional) */}
          {/* 
          {hasNotification && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
              New
            </span>
          )} 
          */}
        </div>
      </div>

      {/* Back Button */}
      <div className="back-button flex items-center text-2xl font-bold p-6">
        <button
          style={{ display: "flex", alignItems: "center" }}
          onClick={() => navigate(-1)}
        >
          <FaAngleLeft />
          <span className="ml-1">Back</span>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="requestContainer mx-5 bg-[#fff]">
        {/* View Selection Buttons */}
        <div className="flex justify-between items-center p-4">
          <div>
            <button
              className={`btn mx-2 border rounded-lg p-2 ${
                currentView === "UserListing"
                  ? "border-black font-bold"
                  : "border-gray-300"
              }`}
              onClick={() => setCurrentView("UserListing")}
            >
              User Listing
            </button>
            <button
              className={`btn mx-2 border rounded-lg p-2 ${
                currentView === "Group"
                  ? "border-black font-bold"
                  : "border-gray-300"
              }`}
              onClick={() => setCurrentView("Group")}
            >
              Group
            </button>
            <button
              className={`btn mx-2 border rounded-lg p-2 ${
                currentView === "Scheduling"
                  ? "border-black font-bold"
                  : "border-gray-300"
              }`}
              onClick={() => setCurrentView("Scheduling")}
            >
              Scheduling
            </button>
            <button
              className={`btn mx-2 border rounded-lg p-2 ${
                currentView === "Campaign"
                  ? "border-black font-bold"
                  : "border-gray-300"
              }`}
              onClick={() => setCurrentView("Campaign")}
            >
              Campaign Temp.
            </button>
          </div>

          {/* Filter and Clear Filter Buttons (Only in UserListing View) */}
          {currentView === "UserListing" && (
            <div>
               {/* <button  className="btn btn-secondary mx-2 border border-green-500 rounded-xl p-2"
               onClick={() => exportToExcel(apDetails, 'MyData.xlsx')}>
        Download Data
      </button> */}
              <button
                className="btn btn-secondary mx-2 border border-black rounded-lg p-2"
                onClick={() => setFilterVisible(true)}
              >
                Filter
              </button>
              <button
                className="btn btn-secondary mx-2 border border-black rounded-lg p-2"
                onClick={clearFilter}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-xl">Loading Users...</span>
          </div>
        ) : (
          // Render the selected view
          renderContent()
        )}

        {/* Filter Modal */}
        {filterVisible && (
          <Filter
            closePopup={() => setFilterVisible(false)}
            applyFilter={applyFilter}
            combinedUserData={combinedUserData}
            groupData={groupData}
            initialFilters={filters || {}}
          />
        )}
      </div>
    </div>
  );
};

export default WhatsappCamp;
