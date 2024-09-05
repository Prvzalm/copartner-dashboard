import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import PageHeader from "../Header/Header";
import CPDiscountCP from "./CPDiscountCP";
import CPDiscountAP from "./CPDiscountAP";
import CPDiscountPopup from "./CPDiscountPopup";
import CPDiscountPopupAP from "./CPDiscountPopupAP";

const CPDiscount = () => {
  const [hasNotification, setHasNotification] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeButton, setActiveButton] = useState("button1");
  const [cpData, setCpData] = useState([]);
  const [affiliatePartners, setAffiliatePartners] = useState([]);
  const [apData, setApData] = useState([]);

  const fetchAPData = async () => {
    try {
      const response = await fetch("https://copartners.in:5009/api/RefferalCoupon");
      if (!response.ok) {
        throw new Error("Something went wrong, status " + response.status);
      }
      const data = await response.json();
      // Filter to show only records with referralMode "AP"
      const filteredData = data.data.filter((coupon) => coupon.referralMode === "AP");

      // Fetch AP names for each coupon
      const apDataWithNames = await Promise.all(
        filteredData.map(async (coupon) => {
          const apResponse = await fetch(
            `https://copartners.in:5133/api/AffiliatePartner/${coupon.cpapId}`
          );

          if (apResponse.ok) {
            const apData = await apResponse.json();
            return {
              ...coupon,
              affiliatePartnerName: apData.data.legalName,
            };
          } else {
            return {
              ...coupon,
              affiliatePartnerName: "Unknown",
            };
          }
        })
      );

      setApData(apDataWithNames);
    } catch (error) {
      toast.error(`Failed to fetch data: ${error.message}`);
    }
  };

  const fetchAffiliatePartners = async () => {
    try {
      const response = await fetch('https://copartners.in:5133/api/AffiliatePartner?page=1&pageSize=10000');
      if (!response.ok) {
        throw new Error("Failed to fetch affiliate partners");
      }
      const data = await response.json();
      setAffiliatePartners(data.data || []);
    } catch (error) {
      console.error("Error fetching affiliate partners:", error);
    }
  };

  const fetchCPData = async () => {
    try {
      const response = await fetch(
        "https://copartners.in:5009/api/RefferalCoupon"
      );
      if (!response.ok) {
        throw new Error("Something went wrong, status " + response.status);
      }
      const data = await response.json();
      // Filter out any coupons with referralMode "AP"
      const filteredData = data.data.filter(coupon => coupon.referralMode !== "AP");
      setCpData(filteredData);
    } catch (error) {
      toast.error(`Failed to fetch data: ${error.message}`);
    }
  };

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
  };

  const openAddPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title={activeButton === "button1" ? "C.P Discount" : "A.P Discount"}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasNotification={hasNotification}
        setHasNotification={setHasNotification}
      />
      <div className="p-4 flex gap-8">
        <button
          onClick={() => handleButtonClick("button1")}
          className={`px-16 py-4 border-2 rounded-xl ${
            activeButton === "button1" ? "border-black" : "border-gray-200"
          } font-semibold`}
        >
          CP
        </button>
        <button
          onClick={() => handleButtonClick("button2")}
          className={`px-16 py-4 border-2 rounded-xl ${
            activeButton === "button2" ? "border-black" : "border-gray-200"
          } font-semibold`}
        >
          A.P
        </button>
      </div>

      <div className="p-4">
        <div className="dashboard-view-section mb-4">
          <div className="table-list-mb">
            <div className="channel-heading flex">
              <h3 className="text-xl font-semibold mr-auto">
                {activeButton === "button1" ? "C.P Discount" : "A.P Discount"}
              </h3>
              <button
                className="border-2 border-black rounded-lg px-4 py-1 mr-4"
                onClick={openAddPopup}
              >
                + Add
              </button>
            </div>
            {activeButton === "button1" && <CPDiscountCP fetchCPData={fetchCPData} setCpData={setCpData} cpData={cpData} />}
            {activeButton === "button2" && <CPDiscountAP fetchAPData={fetchAPData} setApData={setApData}  apData={apData}  />}
          </div>
        </div>
      </div>

      {isPopupOpen && activeButton === "button1" && (
        <CPDiscountPopup fetchCPData={fetchCPData} closeCPDiscount={closePopup} />
      )}
      {isPopupOpen && activeButton === "button2" && (
        <CPDiscountPopupAP fetchAPData={fetchAPData} fetchAffiliatePartners={fetchAffiliatePartners} affiliatePartners={affiliatePartners} setAffiliatePartners={setAffiliatePartners} closeCPDiscount={closePopup} />
      )}

      <ToastContainer />
    </div>
  );
};

export default CPDiscount;
