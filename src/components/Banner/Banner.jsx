// Banner.js

import React, { useState, useEffect } from "react";
import PageHeader from "../Header/Header";
import { ToastContainer, toast } from "react-toastify";
import MarketingContentPopup from "./MarketingContentPopup";
import BannerMarketing from "./BannerMarketing";
import "react-toastify/dist/ReactToastify.css";

const Banner = () => {
  const [hasNotification, setHasNotification] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [bannersData, setBannersData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch("https://poster.copartner.in/api/banner");
      const data = await response.json();
      setBannersData(data);
    } catch (error) {
      toast.error("Failed to fetch banners");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSaveData = () => {
    fetchData();
    setIsPopupOpen(false);
  };

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="Banners"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasNotification={hasNotification}
        setHasNotification={setHasNotification}
      />

      <div className="px-4 flex gap-8">
        <button
          className="px-16 py-4 border-2 rounded-xl border-black font-semibold"
        >
          Banner
        </button>
      </div>

      <div className="p-4">
        <div className="dashboard-view-section mb-4">
          <div className="table-list-mb">
            <div className="channel-heading flex">
              <h3 className="text-xl font-semibold mr-auto">Banner</h3>
              <button
                className="border-2 border-black rounded-lg px-4 py-1 mr-4"
                onClick={() => setIsPopupOpen(true)}
              >
                + Add
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
              {bannersData.map((banner) => (
                <BannerMarketing
                  update={fetchData}
                  key={banner._id}
                  banner={banner}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {isPopupOpen && (
        <MarketingContentPopup
          onClose={handleClosePopup}
          contentType="Banner"
          onSave={handleSaveData}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Banner;
