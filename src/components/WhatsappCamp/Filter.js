import React, { useState } from "react";

const Filter = ({ combinedUserData, applyFilter, closePopup }) => {
  // Initialize filter states with empty arrays to avoid undefined errors
  const [selectedKYC, setSelectedKYC] = useState([]);
  const [selectedReferralMode, setSelectedReferralMode] = useState([]);
  const [selectedLandingUrl, setSelectedLandingUrl] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState([]);
  const [selectedSubscriptionType, setSelectedSubscriptionType] = useState([]);
  const [selectedRAName, setSelectedRAName] = useState([]);
  const [amountRange, setAmountRange] = useState({ start: "", end: "" });

  const handleApplyFilter = () => {
    const filters = {
      selectedKYC,
      selectedReferralMode,
      selectedLandingUrl,
      selectedSubscription,
      selectedSubscriptionType,
      selectedRAName,
      amountRange,
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
  };

  // Ensure combinedUserData is an array before mapping over it
  const uniqueLandingUrls = [...new Set(combinedUserData?.map((user) => user.landingPageUrl) || [])];
  const uniqueSubscriptions = [...new Set(combinedUserData?.flatMap((user) => user.subscriptions?.map((sub) => sub.planType)) || [])];
  const uniqueSubscriptionTypes = [...new Set(combinedUserData?.flatMap((user) => user.subscriptions?.map((sub) => sub.serviceType)) || [])];
  const uniqueRANames = [...new Set(combinedUserData?.flatMap((user) => user.subscriptions?.map((sub) => sub.RAname)) || [])];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg w-2/3">
        <h2 className="text-2xl font-bold mb-4">Filter Options</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* KYC Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">KYC</label>
            <div className="flex space-x-4">
              <label>
                <input
                  type="checkbox"
                  value="Yes"
                  checked={selectedKYC.includes("Yes")}
                  onChange={() => setSelectedKYC((prev) =>
                    prev.includes("Yes") ? prev.filter((item) => item !== "Yes") : [...prev, "Yes"]
                  )}
                />
                Yes
              </label>
              <label>
                <input
                  type="checkbox"
                  value="No"
                  checked={selectedKYC.includes("No")}
                  onChange={() => setSelectedKYC((prev) =>
                    prev.includes("No") ? prev.filter((item) => item !== "No") : [...prev, "No"]
                  )}
                />
                No
              </label>
            </div>
          </div>

          {/* Referral Mode Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Referral Mode</label>
            <div className="flex space-x-4">
              {["CP", "AP", "RA"].map((mode) => (
                <label key={mode}>
                  <input
                    type="checkbox"
                    value={mode}
                    checked={selectedReferralMode.includes(mode)}
                    onChange={() => setSelectedReferralMode((prev) =>
                      prev.includes(mode) ? prev.filter((item) => item !== mode) : [...prev, mode]
                    )}
                  />
                  {mode}
                </label>
              ))}
            </div>
          </div>

          {/* Landing URL Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Landing URL</label>
            <select
              className="block w-full p-2 border border-gray-300 rounded-md"
              onChange={(e) => setSelectedLandingUrl([e.target.value])}
            >
              {uniqueLandingUrls.slice(0, 7).map((url) => (
                <option key={url} value={url}>
                  {url}
                </option>
              ))}
            </select>
          </div>

          {/* Subscription Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Subscription</label>
            <select
              className="block w-full p-2 border border-gray-300 rounded-md"
              onChange={(e) => setSelectedSubscription([e.target.value])}
            >
              {uniqueSubscriptions.slice(0, 7).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Subscription Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Subscription Type</label>
            <select
              className="block w-full p-2 border border-gray-300 rounded-md"
              onChange={(e) => setSelectedSubscriptionType([e.target.value])}
            >
              {uniqueSubscriptionTypes.slice(0, 7).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* RA Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">RA Name</label>
            <select
              className="block w-full p-2 border border-gray-300 rounded-md"
              onChange={(e) => setSelectedRAName([e.target.value])}
            >
              {uniqueRANames.slice(0, 7).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Range */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Amount Range</label>
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
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-500 text-white p-2 rounded-md mr-4"
            onClick={handleApplyFilter}
          >
            Apply
          </button>
          <button
            className="bg-gray-500 text-white p-2 rounded-md"
            onClick={handleClearFilter}
          >
            Clear
          </button>
        </div>

        {/* Close Popup Button */}
        <button
          className="absolute top-2 right-2 text-xl font-bold"
          onClick={closePopup}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Filter;
