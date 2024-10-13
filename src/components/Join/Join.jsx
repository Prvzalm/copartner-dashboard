import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import PageHeader from "../Header/Header";
import JoinPopup from "./JoinPopup";

const Join = () => {
  const [hasNotification, setHasNotification] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await axios.get(
        "https://phonepe.copartner.in/api/getJoinBotData"
      );
      setChannels(response.data);
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast.error("Failed to fetch channels");
    }
  };

  const openSubAdmin = () => {
    setIsPopupOpen(true);
  };

  const closeSubAdmin = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="Join"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasNotification={hasNotification}
        setHasNotification={setHasNotification}
      />
      <div className="p-4">
        <div className="dashboard-view-section mb-4">
          <div className="table-list-mb">
            <div className="channel-heading flex">
              <h3 className="text-xl font-semibold mr-auto">Listing</h3>
              <button
                className="border-2 border-black rounded-lg px-4 py-1 mr-4"
                onClick={openSubAdmin}
              >
                + Add
              </button>
            </div>
            <div className="py-4 px-8">
              <table className="table-list">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", paddingLeft: "2rem" }}>
                      Channel Name
                    </th>
                    <th style={{ textAlign: "left" }}>Links</th>
                    <th style={{ textAlign: "left" }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((channel) => (
                    <tr
                      className="even:bg-gray-100 odd:bg-white"
                      key={channel._id}
                    >
                      <td style={{ textAlign: "left", paddingLeft: "2rem" }}>
                        {channel.channelName}
                      </td>
                      <td style={{ textAlign: "left" }}>
                        {channel.linksWithCounts.map((linkWithCount, index) => (
                          <div key={index} className="text-blue-600">
                            {linkWithCount.link}
                          </div>
                        ))}
                      </td>
                      <td style={{ textAlign: "left" }}>
                        {channel.linksWithCounts.map((linkWithCount, index) => (
                          <div key={index}>{linkWithCount.membersCount}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isPopupOpen && (
        <JoinPopup closeJoin={closeSubAdmin} fetchChannels={fetchChannels} />
      )}
      <ToastContainer />
    </div>
  );
};

export default Join;
