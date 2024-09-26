// src/components/Scheduling.jsx

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios"; // For API requests
import CreateSchedule from "./CreateSchedule";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import { SlRefresh } from "react-icons/sl";
import { toast } from "react-toastify"; // For notifications
import Spinner from "./Spinner";

const Scheduling = () => {
  const rowsPerPage = 10; // Adjust based on preference
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [scheduleGroupData, setScheduleGroupData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isDeleting, setIsDeleting] = useState(false); // Deletion state
  const [countdowns, setCountdowns] = useState({}); // Countdown timers

  // Fetch schedule groups from the backend
  const fetchScheduleGroupData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://whatsapp.copartner.in/api/schedule-groups");
      setScheduleGroupData(response.data);
    } catch (error) {
      console.error("Error fetching schedule groups:", error);
      toast.error("Failed to fetch schedule groups.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchScheduleGroupData();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(scheduleGroupData.length / rowsPerPage);

  // Set countdown timers for each schedule group
  useEffect(() => {
    const updateCountdowns = () => {
      const updatedCountdowns = {};
      scheduleGroupData.forEach((group) => {
        // Find the earliest sent schedule
        const sentSchedules = group.schedules.filter((sched) => sched.status === "sent");
        if (sentSchedules.length > 0) {
          const earliestSentSchedule = sentSchedules.reduce((earliest, current) => {
            const currentTime = new Date(current.scheduleId.scheduledTime);
            const earliestTime = new Date(earliest.scheduleId.scheduledTime);
            return currentTime < earliestTime ? current : earliest;
          });

          // Calculate countdown from the earliest sent schedule
          updatedCountdowns[group._id] = calculateCountdown(earliestSentSchedule.scheduleId.scheduledTime);
        } else {
          // If no sent schedules, set countdown to "00:00:00"
          updatedCountdowns[group._id] = "00:00:00";
        }
      });
      setCountdowns(updatedCountdowns);
    };

    updateCountdowns(); // Initial call

    const interval = setInterval(() => {
      updateCountdowns();
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [scheduleGroupData]);

  // Calculate countdown time from the earliest sent scheduled time (24 hours from that time)
  const calculateCountdown = (earliestSentTime) => {
    const now = new Date().getTime();
    const sentTime = new Date(earliestSentTime).getTime();

    // Add 24 hours to the sent time
    const countdownEnd = sentTime + 24 * 60 * 60 * 1000; // 24 hours in ms
    const timeDifference = countdownEnd - now;

    if (timeDifference <= 0) {
      return "00:00:00"; // Countdown finished
    }

    const hours = Math.floor((timeDifference / (1000 * 60 * 60)));
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDifference / 1000) % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // Handle pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Handle closing the popup
  const handleClosePopup = (shouldFetchData = false) => {
    setShowPopup(false);
    if (shouldFetchData) {
      fetchScheduleGroupData(); // Refresh data
    }
  };

  // Handle deletion of schedule group
  const handleDeleteScheduleGroup = async (groupId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this schedule group?"
    );
    if (!confirmDelete) return;

    setIsDeleting(true); // Start deletion state

    try {
      await axios.delete(
        `https://whatsapp.copartner.in/api/schedule-groups/${groupId}`
      );
      toast.success("Schedule group deleted successfully");
      fetchScheduleGroupData(); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting schedule group:", error);
      toast.error("Failed to delete schedule group.");
    } finally {
      setIsDeleting(false); // End deletion state
    }
  };

  // Determine which schedule groups to display based on pagination
  const displayedScheduleGroups = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return scheduleGroupData.slice(startIdx, endIdx);
  }, [currentPage, rowsPerPage, scheduleGroupData]);

  return (
    <div className="py-6 px-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6"> 
        <div className="flex justify-center gap-2">
          <h2 className="text-2xl font-semibold">Schedule Groups</h2>
        <button className="   items-center text-black rounded-lg  font-bold" onClick={() => fetchScheduleGroupData()}> 
        <SlRefresh className=" rounded-full text-xl items" /></button>
        </div>
        
        <button
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
          onClick={() => setShowPopup(true)}
        >
          <FaPlus className="mr-2" />
          Add Schedule Group
        </button>
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]"> {/* Adjust based on total columns */}
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Schedule Group Name</th>
                <th className="text-left px-4 py-2">Group Name</th>
                <th className="text-left px-4 py-2">Time Left</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-center px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center px-4 py-8 text-gray-500"
                  >
                    Loading schedule groups...
                  </td>
                </tr>
              ) : displayedScheduleGroups.length > 0 ? (
                displayedScheduleGroups.map((group) => {
                  const {
                    _id: groupId,
                    scheduleName,
                    groupId: groupData,
                    status,
                    schedules,
                    dateCreatedOn,
                  } = group;

                  const countdown = countdowns[groupId] || "00:00:00";

                  return (
                    <React.Fragment key={groupId}>
                      {/* Schedule Group Row */}
                      <tr className="bg-gray-100">
                        <td className="px-4 py-2">
                          {dateCreatedOn
                            ? new Date(dateCreatedOn).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-2 font-semibold">
                          {scheduleName || "Unnamed Schedule Group"}
                        </td>
                        <td className="px-4 py-2">
                          {groupData?.groupName || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {countdown}
                        </td>
                        <td className="px-4 py-2">
                          {status}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            className={`flex items-center justify-center bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200 ${
                              isDeleting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={() => handleDeleteScheduleGroup(groupId)}
                            disabled={isDeleting}
                            aria-label="Delete Schedule Group"
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>

                      {/* Schedule Sub-Rows */}
                      {schedules.map((sched) => {
                        const {
                          scheduleId: {
                            _id: scheduleId,
                            scheduledTime,
                            templateId,
                          },
                          status: schedStatus,
                        } = sched;

                        // Ensure templateId is an object with a name
                        const templateName = templateId?.name || "N/A";

                        return (
                          <tr key={scheduleId} className="hover:bg-gray-50 transition duration-200">
                            <td className="px-4 py-2"></td> {/* Empty cell for Date */}
                            <td className="px-4 py-2"></td> {/* Empty cell for Schedule Group Name */}
                            <td className="px-4 py-2">
                              <strong>Scheduled Time:</strong> {scheduledTime
                                ? new Date(scheduledTime).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="px-4 py-2">
                              <strong>Template:</strong> {templateName}
                            </td>
                            <td className="px-4 py-2">
                              {schedStatus}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {/* Actions for individual schedules if needed */}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center px-4 py-8 text-gray-500"
                  >
                    No schedule groups available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            className={`flex items-center px-4 py-2 border rounded-md ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-white hover:bg-gray-100"
            } transition duration-200`}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={`flex items-center px-4 py-2 border rounded-md ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-white hover:bg-gray-100"
            } transition duration-200`}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Popup for adding new schedule group */}
      {showPopup && (
        <CreateSchedule
          closePopup={handleClosePopup}
          fetchScheduleGroupData={fetchScheduleGroupData}
        />
      )}
    </div>
  );
};

export default Scheduling;
