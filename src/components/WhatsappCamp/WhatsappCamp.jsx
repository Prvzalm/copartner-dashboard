import React, { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import PageHeader from "../Header/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserListing from "./UserListing";
import Group from "./Group";
import Filter from "./Filter";
import Scheduling from "./Scheduling";
import Campaign from "./Campaign";

const WhatsappCamp = () => {
  const navigate = useNavigate();
  const [apDetails, setApDetails] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [schedulingData, setSchedulingData] = useState([]);
  const [templateData, setTemplateData] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [currentView, setCurrentView] = useState("UserListing");
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    const fetchAPDetails = async () => {
      try {
        const response = await fetch(
          `https://copartners.in:5131/api/User?page=1&pageSize=100000`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        if (data.isSuccess) {
          const sortedData = data.data.sort(
            (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
          );
          setApDetails(sortedData);
        } else {
          setApDetails([]);
        }
      } catch (error) {
        console.error("Fetching error:", error);
        toast.error(`Failed to fetch data: ${error.message}`);
      }
    };

    fetchAPDetails();
  }, []);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await fetch(`https://whatsapp.copartner.in/api/groups`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch group data");
        }
        const data = await response.json();
        console.log(data);
        setGroupData(data); // Assuming data is an array of groups
      } catch (error) {
        console.error("Fetching error:", error);
        toast.error(`Failed to fetch group data: ${error.message}`);
      }
    };

    fetchGroupData();
  }, []);

  useEffect(() => {
    const fetchSchedulingData = async () => {
      try {
        const response = await fetch(`https://whatsapp.copartner.in/api/schedule`);
        if (!response.ok) {
          throw new Error("Failed to fetch Scheduling data");
        }
        const data = await response.json();
        setSchedulingData(data); // Assuming data is an array of groups
      } catch (error) {
        console.error("Fetching error:", error);
        toast.error(`Failed to fetch Schedule data: ${error.message}`);
      }
    };

    fetchSchedulingData();
  }, []);
  const fetchTemplateData = async () => {
    try {
      const response = await fetch(`https://whatsapp.copartner.in/api/templates`);
      if (!response.ok) {
        throw new Error("Failed to fetch template data");
      }
      const data = await response.json();
      setTemplateData(data); // Assuming data is an array of groups
    } catch (error) {
      console.error("Fetching error:", error);
      toast.error(`Failed to fetch template data: ${error.message}`);
    }
  };
  useEffect(() => {
    

    fetchTemplateData();
  }, []);

  useEffect(() => {
    const fetchAdditionalUserDetails = async () => {
      const userIds = apDetails.map((user) => user.id);

      const operations = userIds.map(async (userId) => {
        try {
          const response = await fetch(
            `https://copartners.in:5009/api/Subscriber/GetByUserId/${userId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch subscriber data");
          }
          const subscriberData = await response.json();
          return {
            userId,
            subscriptions: subscriberData.data.map((sub) => ({
              amount: sub?.totalAmount || 0,
              RAname: sub?.subscription.experts.name || "N/A",
              planType: sub?.subscription.planType || "N/A",
              serviceType: sub?.subscription.serviceType || "N/A",
            })),
          };
        } catch (error) {
          console.error(`Error fetching subscriber data for user ${userId}:`, error);
          return null;
        }
      });

      const additionalData = await Promise.all(operations);
      setUserDetails(additionalData.filter(Boolean));
    };

    if (apDetails.length > 0) {
      fetchAdditionalUserDetails();
    }
  }, [apDetails]);

  const combinedUserData = apDetails.map((user) => {
    const additionalData =
      userDetails.find((detail) => detail.userId === user.id) || {
        subscriptions: [],
      };
    return { ...user, subscriptions: additionalData.subscriptions };
  });

  const applyFilter = (filters) => {
    setFilters(filters);
    setFilterVisible(false);
  };

  const clearFilter = () => {
    setFilters(null);
    setFilterVisible(false);
  };

  const filteredUserData = combinedUserData.filter((user) => {
    if (!filters) return true;

    const {
      selectedKYC,
      selectedReferralMode,
      selectedLandingUrl,
      selectedSubscription,
      selectedSubscriptionType,
      selectedRAName,
      amountRange,
      selectedAmount, // New amount filter
    } = filters;

    let matches = true;

    if (selectedKYC.length > 0 && !selectedKYC.includes(user.isKYC ? "Yes" : "No")) {
      matches = false;
    }
    if (
      selectedReferralMode.length > 0 &&
      !selectedReferralMode.includes(user.referralMode || "N/A")
    ) {
      matches = false;
    }
    if (
      selectedLandingUrl.length > 0 &&
      !user.landingPageUrl.includes(selectedLandingUrl[0])
    ) {
      matches = false;
    }
    if (
      selectedSubscription.length > 0 &&
      !user.subscriptions.some((sub) =>
        sub.planType.toLowerCase().includes(selectedSubscription[0].toLowerCase())
      )
    ) {
      matches = false;
    }
    if (
      selectedSubscriptionType.length > 0 &&
      !user.subscriptions.some((sub) =>
        sub.serviceType.toLowerCase().includes(selectedSubscriptionType[0].toLowerCase())
      )
    ) {
      matches = false;
    }
    if (
      selectedRAName.length > 0 &&
      !user.subscriptions.some((sub) =>
        sub.RAname.toLowerCase().includes(selectedRAName[0].toLowerCase())
      )
    ) {
      matches = false;
    }
    if (selectedAmount.length > 0) {
      const paymentsCount = user.subscriptions.length;
      if (selectedAmount.includes("one") && paymentsCount > 1) {
        matches = false;
      }
      if (selectedAmount.includes("more") && paymentsCount <= 1) {
        matches = false;
      }
    }
    if (amountRange.start !== "" && amountRange.end !== "") {
      const totalAmount = user.subscriptions.reduce(
        (sum, sub) => sum + sub.amount,
        0
      );
      if (
        totalAmount < parseFloat(amountRange.start) ||
        totalAmount > parseFloat(amountRange.end)
      ) {
        matches = false;
      }
    }

    return matches;
  });

  const renderContent = () => {
    switch (currentView) {
      case "UserListing":
        return <UserListing apDetails={filteredUserData} />;
      case "Group":
        return <Group groupData={groupData} />;
      case "Scheduling":
        return <div><Scheduling schedulingData={schedulingData} /></div>;
      case "Campaign":
        return <div> <Campaign templateData={templateData} fetchTemplateData={fetchTemplateData} /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="Whatsapp Camp."
        searchQuery=""
        setSearchQuery={() => {}}
        hasNotification={false}
        setHasNotification={() => {}}
      />
      <div className="back-button flex items-center text-2xl font-bold p-6">
        <button
          style={{ display: "flex", alignItems: "center" }}
          onClick={() => navigate(-1)}
        >
          <FaAngleLeft />
          <span className="ml-1">Back</span>
        </button>
      </div>

      <div className="requestContainer mx-5 bg-[#fff]">
        <div className="flex justify-between items-center p-4">
          <div>
            <button
              className={`btn mx-2 border rounded-lg p-2 ${
                currentView === "UserListing" ? "border-black font-bold" : "border-gray-300"
              }`}
              onClick={() => setCurrentView("UserListing")}
            >
              User Listing
            </button>
            <button
              className={`btn mx-2 border rounded-lg p-2 ${
                currentView === "Group" ? "border-black font-bold" : "border-gray-300"
              }`}
              onClick={() => setCurrentView("Group")}
            >
              Group
            </button>
            <button
              className={`btn mx-2 border rounded-lg p-2 ${
                currentView === "Scheduling" ? "border-black font-bold" : "border-gray-300"
              }`}
              onClick={() => setCurrentView("Scheduling")}
            >
              Scheduling
            </button>
            <button
              className={`btn mx-2 border rounded-lg p-2 ${
                currentView === "Campaign" ? "border-black font-bold" : "border-gray-300"
              }`}
              onClick={() => setCurrentView("Campaign")}
            >
              Campaign Temp.
            </button>
          </div>

          {currentView === "UserListing" && (
            <div>
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

        {renderContent()}

        {filterVisible && (
          <Filter
            closePopup={() => setFilterVisible(false)}
            applyFilter={applyFilter}
            clearFilter={clearFilter}
            combinedUserData={combinedUserData}
            groupData={groupData}
          />
        )}
      </div>
    </div>
  );
};

export default WhatsappCamp;
