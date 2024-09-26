// Filter.jsx
import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";

const Filter = ({
  combinedUserData,
  groupData,
  applyFilter,
  closePopup,
  initialFilters = {},
}) => {
  const isFirstLoad = useRef(true);

  // Initialize state with passed initialFilters or fallback to default values
  const [selectedKYC, setSelectedKYC] = useState(initialFilters.selectedKYC || []);
  const [selectedReferralMode, setSelectedReferralMode] = useState(
    initialFilters.selectedReferralMode || []
  );
  const [selectedLandingUrl, setSelectedLandingUrl] = useState(
    initialFilters.selectedLandingUrl || []
  );
  const [selectedSubscription, setSelectedSubscription] = useState(
    initialFilters.selectedSubscription || []
  );
  const [selectedSubscriptionType, setSelectedSubscriptionType] = useState(
    initialFilters.selectedSubscriptionType || []
  );
  const [selectedRAName, setSelectedRAName] = useState(
    initialFilters.selectedRAName || []
  );
  const [amountRange, setAmountRange] = useState(
    initialFilters.amountRange || { start: "", end: "" }
  );
  const [selectedAmount, setSelectedAmount] = useState(
    initialFilters.selectedAmount || []
  );
  const [selectedGroup, setSelectedGroup] = useState(
    initialFilters.selectedGroup || []
  );
  const [startDate, setStartDate] = useState(initialFilters.startDate || "");
  const [endDate, setEndDate] = useState(initialFilters.endDate || "");

  // Utility function to ensure arrays are handled correctly
  const safeArray = (array) => (Array.isArray(array) ? array : []);

  // Extract unique values for each filter, handling nulls as "n/a"
  const uniqueKYCOptions = ["yes", "no"];

  const uniqueReferralModes = [
    ...new Set(
      safeArray(combinedUserData).flatMap((user) =>
        user.referralMode ? [user.referralMode.trim().toLowerCase()] : ["n/a"]
      )
    ),
  ];

  const uniqueLandingUrls = [
    ...new Set(
      safeArray(combinedUserData).flatMap((user) =>
        user.landingPageUrl ? [user.landingPageUrl.trim().toLowerCase()] : ["n/a"]
      )
    ),
  ];

  const uniqueSubscriptions = [
    ...new Set(
      safeArray(combinedUserData).flatMap((user) =>
        safeArray(user.subscriptions).map((sub) =>
          sub.planType ? sub.planType.trim().toLowerCase() : "n/a"
        )
      )
    ),
  ];

  const uniqueSubscriptionTypes = [
    ...new Set(
      safeArray(combinedUserData).flatMap((user) =>
        safeArray(user.subscriptions).map((sub) =>
          sub.serviceType ? sub.serviceType.trim().toLowerCase() : "n/a"
        )
      )
    ),
  ];

  const uniqueRANames = [
    ...new Set(
      safeArray(combinedUserData).flatMap((user) =>
        safeArray(user.subscriptions).map((sub) =>
          sub.RAname ? sub.RAname.trim().toLowerCase() : "n/a"
        )
      )
    ),
  ];

  const uniqueGroups = [
    ...new Set(
      groupData?.map((group) =>
        group.groupName ? group.groupName.trim().toLowerCase() : "n/a"
      ) || []
    ),
  ];

  // Ensure "n/a" is included in relevant filter options
  if (!uniqueLandingUrls.includes("n/a")) uniqueLandingUrls.push("n/a");
  if (!uniqueSubscriptions.includes("n/a")) uniqueSubscriptions.push("n/a");
  if (!uniqueSubscriptionTypes.includes("n/a"))
    uniqueSubscriptionTypes.push("n/a");
  if (!uniqueRANames.includes("n/a")) uniqueRANames.push("n/a");
  if (!uniqueReferralModes.includes("n/a")) uniqueReferralModes.push("n/a");

  const formatOptions = (array) =>
    array.map((item) => ({
      value: item,
      label:
        item === "n/a"
          ? "N/A"
          : item
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
    }));

  // Handle Apply Filter
  const handleApplyFilter = () => {
    const filters = {
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
    };
    applyFilter(filters);
    closePopup();
  };

  // Handle Clear Filter
  const handleClearFilter = () => {
    setSelectedKYC([]);
    setSelectedReferralMode([]);
    setSelectedLandingUrl([]);
    setSelectedSubscription([]);
    setSelectedSubscriptionType([]);
    setSelectedRAName([]);
    setAmountRange({ start: "", end: "" });
    setSelectedAmount([]);
    setSelectedGroup([]);
    setStartDate("");
    setEndDate("");
  };

  // Initialize filters on first load
  useEffect(() => {
    const filters = initialFilters || {};

    if (isFirstLoad.current) {
      setSelectedKYC(filters.selectedKYC || []);
      setSelectedReferralMode(filters.selectedReferralMode || []);
      setSelectedLandingUrl(filters.selectedLandingUrl || []);
      setSelectedSubscription(filters.selectedSubscription || []);
      setSelectedSubscriptionType(filters.selectedSubscriptionType || []);
      setSelectedRAName(filters.selectedRAName || []);
      setAmountRange(filters.amountRange || { start: "", end: "" });
      setSelectedAmount(filters.selectedAmount || []);
      setSelectedGroup(filters.selectedGroup || []);
      setStartDate(filters.startDate || "");
      setEndDate(filters.endDate || "");
      isFirstLoad.current = false;
    }
  }, [initialFilters]);

  // Debugging: Log unique filter options
  useEffect(() => {
    console.log("Unique RA Names:", uniqueRANames);
  }, [uniqueRANames]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg w-3/4 max-w-4xl relative overflow-y-auto max-h-screen">
        <h2 className="text-3xl font-bold mb-6">Filter Options</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KYC Filter */}
          <div>
  <label className="block text-lg font-medium text-gray-700 mb-2">
    KYC
  </label>
  <div className="flex space-x-4">
    {uniqueKYCOptions.map((kycOption) => (
      <label key={kycOption} className="flex items-center cursor-pointer">
        {/* Hidden Radio Input */}
        <input
          type="radio"
          name="kyc"
          value={kycOption}
          checked={selectedKYC === kycOption}
          onChange={() => setSelectedKYC(kycOption)}
          className="hidden"
        />
        
        {/* Custom Styled Square Radio */}
        <span
          className={`w-5 h-5 mr-2 border-2 border-gray-500 rounded-sm flex-shrink-0 ${
            selectedKYC === kycOption ? "bg-blue-500" : "bg-white"
          } transition-colors duration-200`}
        ></span>
        
        {/* Option Label */}
        {kycOption}
      </label>
    ))}
  </div>
</div>


          {/* Referral Mode Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Referral Mode
            </label>
            <div className="flex flex-wrap">
              {uniqueReferralModes.map((mode) => (
                <label key={mode} className="flex items-center mr-4 mb-2">
                  <input
                    type="checkbox"
                    value={mode}
                    checked={selectedReferralMode.includes(mode)}
                    onChange={() =>
                      setSelectedReferralMode((prev) =>
                        prev.includes(mode)
                          ? prev.filter((item) => item !== mode)
                          : [...prev, mode]
                      )
                    }
                    className="hidden"
                  />
                  <span
                    className={`w-5 h-5 mr-2 border-2 border-gray-500 rounded-sm cursor-pointer ${
                      selectedReferralMode.includes(mode)
                        ? "bg-blue-500"
                        : "bg-white"
                    }`}
                  ></span>
                  {mode === "n/a" ? "N/A" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Landing URL Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Landing URL
            </label>
            <Select
              isMulti
              options={formatOptions(uniqueLandingUrls)}
              value={selectedLandingUrl.map((url) => ({
                value: url,
                label: url === "n/a" ? "N/A" : url,
              }))}
              onChange={(selectedOptions) =>
                setSelectedLandingUrl(
                  selectedOptions
                    ? selectedOptions.map((option) => option.value)
                    : []
                )
              }
              placeholder="Select Landing URLs"
              classNamePrefix="react-select"
            />
          </div>

          {/* Subscription Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Subscription
            </label>
            <Select
              isMulti
              options={formatOptions(uniqueSubscriptions)}
              value={selectedSubscription.map((sub) => ({
                value: sub,
                label: sub === "n/a" ? "N/A" : sub,
              }))}
              onChange={(selectedOptions) =>
                setSelectedSubscription(
                  selectedOptions
                    ? selectedOptions.map((option) => option.value)
                    : []
                )
              }
              placeholder="Select Subscriptions"
              classNamePrefix="react-select"
            />
          </div>

          {/* Subscription Type Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Subscription Type
            </label>
            <Select
              isMulti
              options={formatOptions(uniqueSubscriptionTypes)}
              value={selectedSubscriptionType.map((type) => ({
                value: type,
                label: type === "n/a" ? "N/A" : type,
              }))}
              onChange={(selectedOptions) =>
                setSelectedSubscriptionType(
                  selectedOptions
                    ? selectedOptions.map((option) => option.value)
                    : []
                )
              }
              placeholder="Select Subscription Types"
              classNamePrefix="react-select"
            />
          </div>

          {/* RA Name Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              RA Name
            </label>
            <Select
              isMulti
              options={formatOptions(uniqueRANames)}
              value={selectedRAName.map((name) => ({
                value: name,
                label:
                  name === "n/a"
                    ? "N/A"
                    : name
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" "),
              }))}
              onChange={(selectedOptions) =>
                setSelectedRAName(
                  selectedOptions
                    ? selectedOptions.map((option) => option.value)
                    : []
                )
              }
              placeholder="Select RA Names"
              classNamePrefix="react-select"
            />
          </div>

          {/* Amount Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Amount
            </label>
            <Select
              isMulti
              options={formatOptions(["one", "more than one"])}
              value={selectedAmount.map((amount) => ({
                value: amount,
                label:
                  amount === "n/a"
                    ? "N/A"
                    : amount
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" "),
              }))}
              onChange={(selectedOptions) =>
                setSelectedAmount(
                  selectedOptions
                    ? selectedOptions.map((option) => option.value)
                    : []
                )
              }
              placeholder="Select Amount Criteria"
              classNamePrefix="react-select"
            />
          </div>

          {/* Amount Range Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Amount Range
            </label>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Start"
                value={amountRange.start}
                onChange={(e) =>
                  setAmountRange((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }))
                }
                className="block w-1/2 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="End"
                value={amountRange.end}
                onChange={(e) =>
                  setAmountRange((prev) => ({
                    ...prev,
                    end: e.target.value,
                  }))
                }
                className="block w-1/2 p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Group Filter */}
      

          {/* Date Range Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex space-x-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-1/2 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-1/2 p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
            onClick={handleApplyFilter}
          >
            Apply
          </button>
          <button
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
            onClick={handleClearFilter}
          >
            Clear
          </button>
        </div>

        {/* Close Popup Button */}
        <button
          className="absolute top-4 right-4 text-2xl font-bold text-gray-700"
          onClick={closePopup}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Filter;
