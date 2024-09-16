import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";

const Filter = ({ combinedUserData, groupData, applyFilter, closePopup, initialFilters = {} }) => {
  const isFirstLoad = useRef(true);

  // Initialize state with passed initialFilters or fallback to default values
  const [selectedKYC, setSelectedKYC] = useState(initialFilters.selectedKYC || []);
  const [selectedReferralMode, setSelectedReferralMode] = useState(initialFilters.selectedReferralMode || []);
  const [selectedLandingUrl, setSelectedLandingUrl] = useState(initialFilters.selectedLandingUrl || []);
  const [selectedSubscription, setSelectedSubscription] = useState(initialFilters.selectedSubscription || []);
  const [selectedSubscriptionType, setSelectedSubscriptionType] = useState(initialFilters.selectedSubscriptionType || []);
  const [selectedRAName, setSelectedRAName] = useState(initialFilters.selectedRAName || []);
  const [amountRange, setAmountRange] = useState(initialFilters.amountRange || { start: "", end: "" });
  const [selectedAmount, setSelectedAmount] = useState(initialFilters.selectedAmount || []);
  const [selectedGroup, setSelectedGroup] = useState(initialFilters.selectedGroup || []);
  const [startDate, setStartDate] = useState(initialFilters.startDate || "");
  const [endDate, setEndDate] = useState(initialFilters.endDate || "");

  const safeArray = (array) => (Array.isArray(array) ? array : []);

  const uniqueLandingUrls = [...new Set(safeArray(combinedUserData).map((user) => user.landingPageUrl || "N/A"))];
  const uniqueSubscriptions = [
    ...new Set(
      safeArray(combinedUserData).flatMap((user) =>
        safeArray(user.subscriptions).map((sub) => sub.planType || "N/A")
      )
    ),
  ];
  const uniqueSubscriptionTypes = [
    ...new Set(
      safeArray(combinedUserData).flatMap((user) =>
        safeArray(user.subscriptions).map((sub) => sub.serviceType || "N/A")
      )
    ),
  ];
  const uniqueRANames = [
    ...new Set(
      safeArray(combinedUserData).flatMap((user) =>
        safeArray(user.subscriptions).map((sub) => sub.RAname || "N/A")
      )
    ),
  ];
  const uniqueGroups = [...new Set(groupData?.map((group) => group.groupName) || [])];

  const formatOptions = (array) => array.map((item) => ({ value: item, label: item }));

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

  useEffect(() => {
    if (isFirstLoad.current) {
      setSelectedKYC(initialFilters.selectedKYC || []);
      setSelectedReferralMode(initialFilters.selectedReferralMode || []);
      setSelectedLandingUrl(initialFilters.selectedLandingUrl || []);
      setSelectedSubscription(initialFilters.selectedSubscription || []);
      setSelectedSubscriptionType(initialFilters.selectedSubscriptionType || []);
      setSelectedRAName(initialFilters.selectedRAName || []);
      setAmountRange(initialFilters.amountRange || { start: "", end: "" });
      setSelectedAmount(initialFilters.selectedAmount || []);
      setSelectedGroup(initialFilters.selectedGroup || []);
      setStartDate(initialFilters.startDate || "");
      setEndDate(initialFilters.endDate || "");
      isFirstLoad.current = false;
    }
  }, [initialFilters]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg w-2/3 relative">
        <h2 className="text-4xl font-bold mb-4">Filter Options</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* KYC Filter */}
          <div>
            <label className="block text-xl pb-2 font-medium text-gray-700">KYC</label>
            <div className="flex space-x-4">
              {["Yes", "No"].map((kycOption) => (
                <label key={kycOption} className="flex items-center">
                  <input
                    type="radio"
                    name="kyc"
                    value={kycOption}
                    checked={selectedKYC.includes(kycOption)}
                    onChange={() => setSelectedKYC([kycOption])}
                    className="hidden"
                  />
                  <span
                    className={`w-5 h-5 mr-2 border-2 border-gray-500 rounded-sm cursor-pointer ${
                      selectedKYC.includes(kycOption) ? "bg-blue-500" : "bg-white"
                    }`}
                  ></span>
                  {kycOption}
                </label>
              ))}
            </div>
          </div>

          {/* Referral Mode Filter */}
          <div>
            <label className="block text-xl pb-2 font-medium text-gray-700">Referral Mode</label>
            <div className="flex space-x-4">
              {["CP", "AP", "RA"].map((mode) => (
                <label key={mode} className="flex items-center">
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
                      selectedReferralMode.includes(mode) ? "bg-blue-500" : "bg-white"
                    }`}
                  ></span>
                  {mode}
                </label>
              ))}
            </div>
          </div>

          {/* Landing URL Filter */}
          <div>
            <label className="block text-xl pb-2 font-medium text-gray-700">Landing URL</label>
            <Select
              isMulti
              options={formatOptions(uniqueLandingUrls)}
              value={selectedLandingUrl.map((url) => ({ value: url, label: url }))}
              onChange={(selectedOptions) =>
                setSelectedLandingUrl(selectedOptions.map((option) => option.value))
              }
              placeholder="Select Landing URL"
              classNamePrefix="react-select"
            />
          </div>

          {/* Subscription Filter */}
          <div>
            <label className="block text-xl pb-2 font-medium text-gray-700">Subscription</label>
            <Select
              isMulti
              options={formatOptions(uniqueSubscriptions)}
              value={selectedSubscription.map((sub) => ({ value: sub, label: sub }))}
              onChange={(selectedOptions) =>
                setSelectedSubscription(selectedOptions.map((option) => option.value))
              }
              placeholder="Select Subscription"
              classNamePrefix="react-select"
            />
          </div>

          {/* Subscription Type Filter */}
          <div>
            <label className="block text-xl pb-2 font-medium text-gray-700">Subscription Type</label>
            <Select
              isMulti
              options={formatOptions(uniqueSubscriptionTypes)}
              value={selectedSubscriptionType.map((type) => ({ value: type, label: type }))}
              onChange={(selectedOptions) =>
                setSelectedSubscriptionType(selectedOptions.map((option) => option.value))
              }
              placeholder="Select Subscription Type"
              classNamePrefix="react-select"
            />
          </div>

          {/* RA Name Filter */}
          <div>
            <label className="block text-xl pb-2 font-medium text-gray-700">RA Name</label>
            <Select
              isMulti
              options={formatOptions(uniqueRANames)}
              value={selectedRAName.map((name) => ({ value: name, label: name }))}
              onChange={(selectedOptions) =>
                setSelectedRAName(selectedOptions.map((option) => option.value))
              }
              placeholder="Select RA Name"
              classNamePrefix="react-select"
            />
          </div>

          {/* Amount Filter */}
          <div>
            <label className="block text-xl pb-2 font-medium text-gray-700">Amount</label>
            <Select
              isMulti
              options={formatOptions(["One", "More than One"])}
              value={selectedAmount.map((amount) => ({ value: amount, label: amount }))}
              onChange={(selectedOptions) =>
                setSelectedAmount(selectedOptions.map((option) => option.value))
              }
              placeholder="Select Amount"
              classNamePrefix="react-select"
            />
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-xl pb-2 font-medium text-gray-700">Amount Range</label>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Start"
                value={amountRange.start}
                onChange={(e) =>
                  setAmountRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="block w-1/2 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="End"
                value={amountRange.end}
                onChange={(e) =>
                  setAmountRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="block w-1/2 p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-xl pb-2 font-medium text-gray-700">Group</label>
            <Select
              isMulti
              options={formatOptions(uniqueGroups)}
              value={selectedGroup.map((group) => ({ value: group, label: group }))}
              onChange={(selectedOptions) =>
                setSelectedGroup(selectedOptions.map((option) => option.value))
              }
              placeholder="Select Group"
              classNamePrefix="react-select"
            />
          </div>

          {/* Date Range Filter */}
          <div className="col-span-2">
            <label className="block text-xl pb-2 font-medium text-gray-700">Date Range</label>
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
        <div className="flex pt-2 justify-center mt-4">
          <button
            className="bg-blue-500 w-1/5 text-white p-2 rounded-md mr-4"
            onClick={handleApplyFilter}
          >
            Apply
          </button>
          <button
            className="bg-gray-500 w-1/5 text-white p-2 rounded-md"
            onClick={handleClearFilter}
          >
            Clear
          </button>
        </div>

        {/* Close Popup Button */}
        <button
          className="absolute top-2 right-2 text-4xl pr-4 font-bold"
          onClick={closePopup}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Filter;
