import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios to make API requests
import CreateSchedule from "./CreateSchedule";
import { FaTrashAlt } from "react-icons/fa";
import Bin from "../../assets/TrashBinMinimalistic.png";

const Scheduling = () => {
  const rowsPerPage = 100; // Define how many rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [schedulingData, setSchedulingData] = useState([]);
  const [templateNames, setTemplateNames] = useState({});
  const [countdowns, setCountdowns] = useState({}); // Store countdown values for each group

  // Fetch schedules from the backend
  const fetchScheduleData = async () => {
    try {
      const response = await axios.get("https://whatsapp.copartner.in/api/schedule");
      setSchedulingData(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  // Fetch template names based on templateId
  const fetchTemplateNames = async (validGroupData) => {
    const uniqueTemplateIds = [...new Set(validGroupData.map(group => group.templateId))];
    const templateNamePromises = uniqueTemplateIds.map(async (templateId) => {
      if (!templateNames[templateId]) { // Fetch only if not already in state
        try {
          const response = await axios.get(`https://whatsapp.copartner.in/api/templates/${templateId}`);
          return { [templateId]: response.data.name }; // Assuming template name is in response.data.name
        } catch (error) {
          console.error(`Error fetching template ${templateId}:`, error);
          return { [templateId]: "Unknown Template" }; // Fallback for errors
        }
      }
      return {};
    });

    const templateNameResults = await Promise.all(templateNamePromises);
    const names = templateNameResults.reduce((acc, result) => ({ ...acc, ...result }), {});
    setTemplateNames(prev => ({ ...prev, ...names }));
  };

  // Use Effect to fetch data on component mount
  useEffect(() => {
    fetchScheduleData();
  }, []); // Empty dependency array ensures this runs once on mount

  // Ensure groupData is an array and access the actual data array
  const validGroupData = Array.isArray(schedulingData) ? schedulingData : [];

  // Group schedules by groupName and sort by `scheduledTime`
  const groupedData = validGroupData.reduce((acc, group) => {
    // Check if groupId exists and has groupName
    if (group.groupId && group.groupId.groupName) {
      if (!acc[group.groupId.groupName]) {
        acc[group.groupId.groupName] = [];
      }
      acc[group.groupId.groupName].push(group);
    } else {
      console.warn(`Missing groupId or groupName for group with id: ${group._id}`);
    }
    return acc;
  }, {});

  // Sort schedules by `scheduledTime` within each group
  const sortedGroupedData = Object.entries(groupedData).map(([groupName, schedules]) => {
    const sortedSchedules = schedules.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    return { groupName, schedules: sortedSchedules };
  });

  // Fetch template names when scheduling data changes
  useEffect(() => {
    if (validGroupData.length > 0) {
      fetchTemplateNames(validGroupData);
    }
  }, [validGroupData]);

  // Calculate total pages based on sortedGroupedData
  const totalPages = Math.ceil(sortedGroupedData.length / rowsPerPage);

  // Set the earliest schedule for countdown (only 1 per group)
  useEffect(() => {
    const countdownTimers = {};
    
    sortedGroupedData.forEach(({ groupName, schedules }) => {
      if (schedules.length > 0) {
        const earliestSchedule = schedules[0];
        countdownTimers[groupName] = calculateCountdown(earliestSchedule.scheduledTime);
      }
    });

    setCountdowns(countdownTimers);

    const interval = setInterval(() => {
      const updatedCountdowns = {};
      sortedGroupedData.forEach(({ groupName, schedules }) => {
        if (schedules.length > 0) {
          const earliestSchedule = schedules[0];
          updatedCountdowns[groupName] = calculateCountdown(earliestSchedule.scheduledTime);
        }
      });
      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [schedulingData]);

  // Calculate countdown time from the scheduled time (24 hours from scheduled time)
  const calculateCountdown = (scheduledTime) => {
    const now = new Date().getTime();
    const scheduledDate = new Date(scheduledTime).getTime();
    
    // Add 24 hours to the scheduled time
    const countdownEnd = scheduledDate + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeDifference = countdownEnd - now;

    if (timeDifference <= 0) {
      return "00:00"; // Time is up
    }

    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDifference / 1000 / 60) % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Handle pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle closing the popup
  const handleClosePopup = (shouldFetchData = false) => {
    setShowPopup(false);
    if (shouldFetchData) {
      fetchScheduleData(); // Refetch data after adding a schedule
    }
  };

  // Handle deletion of schedule
  const handleDeleteSchedule = async (scheduleId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this schedule?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://whatsapp.copartner.in/api/schedule/${scheduleId}`);
      alert("Schedule deleted successfully");
      fetchScheduleData(); // Refetch data after deletion
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Failed to delete schedule");
    }
  };

  return (
    <div className="py-4 px-8">
      <div className="table-container overflow-x-auto">
        <h2 className="pl-3 text-xl font-semibold">Schedule Listing</h2>
        <div className="flex justify-end space-x-4">
          {/* Button to trigger the popup */}
          <button onClick={() => setShowPopup(true)} className="btn btn-primary border border-black rounded-lg p-1">
            + Add
          </button>
        </div>

        <table className="table-list min-w-max mt-4">
          <thead>
            <tr className="requestColumns">
              <th style={{ textAlign: "left", paddingLeft: "2rem" }}>Date</th>
              <th style={{ textAlign: "left" }}>Group Name</th>
              <th>Scheduling Time</th>
              <th>Campaign Temp.</th>
              <th>Countdown</th> {/* Changed column name to Countdown */}
              <th>Action</th> {/* Added Action column */}
            </tr>
          </thead>
          <tbody>
            {sortedGroupedData.length > 0 &&
              sortedGroupedData.map(({ groupName, schedules }) => (
                <React.Fragment key={groupName}>
                  {/* Group row */}
                  <tr className="request-numbers font-semibold">
                    <td
                      style={{ textAlign: "left", paddingLeft: "2rem" }}
                      className="p-3"
                    >
                      {schedules[0].groupId?.dateCreatedOn || "N/A"} {/* Show the date created */}
                    </td>
                    <td style={{ textAlign: "left" }} className="p-3">
                      {groupName || "Unnamed Group"} {/* Show group name or fallback */}
                    </td>
                    <td className="p-3"></td> {/* Empty cells for group row */}
                    <td className="p-3"></td>
                    <td className="p-3">
                      {countdowns[groupName] || "00:00"} {/* Show countdown */}
                    </td>
                    <td className="p-3"></td>
                  </tr>
                  {/* Sub-rows for schedules */}
                  {schedules.map((group) => {
                    const {
                      _id: scheduleId,
                      status,
                      templateId,
                      scheduledTime,
                    } = group;

                    return (
                      <tr key={scheduleId} className="request-numbers font-normal">
                        <td className="p-3"></td> {/* Empty cell for group name */}
                        <td className="p-3"></td> {/* Empty cell for group name */}
                        <td className="p-3">
                          {new Date(scheduledTime).toLocaleString() || "N/A"} {/* Show scheduling time */}
                        </td>
                        <td className="p-3">
                          {templateNames[templateId] || "Fetching..."} {/* Show template name */}
                        </td>
                        <td className="p-3">
                          {status === "sent"
                            ? calculateCountdown(scheduledTime)
                            : "00:00"} {/* Countdown for 'sent' status */}
                        </td>
                        <td className="p-3">
                          <button
                             // Call API to delete schedule
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            <img
                          className="w-6 h-6 cursor-pointer"
                          src={Bin}
                          alt="Delete"
                          onClick={() => handleDeleteSchedule(scheduleId)}
                        />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="pagination-controls mt-4 flex justify-center items-center">
        <button
          className="btn btn-primary mx-2 border border-black rounded-lg p-1"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-primary mx-2 border border-black rounded-lg p-1"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Popup for adding new schedule */}
      {showPopup && (
        <CreateSchedule closePopup={() => handleClosePopup(true)} fetchScheduleData={fetchScheduleData} /> 
      )}
    </div>
  );
};

export default Scheduling;
