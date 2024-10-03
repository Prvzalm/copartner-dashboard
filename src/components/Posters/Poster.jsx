import React, { useState } from "react";
import PageHeader from "../Header/Header";
import { ToastContainer } from "react-toastify";
import AdminPoster from "./AdminPoster";
import RAPoster from "./RAPoster";

const Poster = () => {
  const [activeButton, setActiveButton] = useState("Admin Poster");
  const [hasNotification, setHasNotification] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
  };

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="User Data"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasNotification={hasNotification}
        setHasNotification={setHasNotification}
      />

      <div className="px-4 flex md:gap-8 gap-2">
        <button
          onClick={() => handleButtonClick("Admin Poster")}
          className={`md:px-8 px-2 md:py-2 py-2 md:max-w-44 border-2 rounded-xl ${
            activeButton === "Admin Poster" ? "border-black" : "border-gray-200"
          } font-semibold`}
        >
          Admin Poster
        </button>
        <button
          onClick={() => handleButtonClick("RA Poster")}
          className={`md:px-8 px-2 md:py-2 py-2 md:max-w-44 border-2 rounded-xl ${
            activeButton === "RA Poster" ? "border-black" : "border-gray-200"
          } font-semibold`}
        >
          RA Poster
        </button>
      </div>

      <div className="p-4">
        <div className="dashboard-view-section mb-4">
          <div className="table-list-mb">
            <div className="channel-heading flex">
              <h3 className="text-xl font-semibold mr-auto">{activeButton}</h3>
            </div>
            {activeButton === "Admin Poster" && (
              <AdminPoster searchQuery={searchQuery} />
            )}
            {activeButton === "RA Poster" && (
              <RAPoster searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Poster;
