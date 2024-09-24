// src/components/Scheduling.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios"; // Import axios to make API requests
import CreateSchedule from "./CreateSchedule";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify"; // Assuming you're using react-toastify for notifications


const Scheduling = () => {
  const rowsPerPage = 100; // Define how many rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [schedulingData, setSchedulingData] = useState([]);
  const [templateNames, setTemplateNames] = useState({});
  const [countdowns, setCountdowns] = useState({}); // Store countdown values for each group
  const [isLoading, setIsLoading] = useState(true); // Loading state for data fetching
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for deletion

  // Fetch schedules from the backend
  const fetchScheduleData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://whatsapp.copartner.in/api/schedule");
      setSchedulingData(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to fetch schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch template names based on templateId
  const fetchTemplateNames = async (validGroupData) => {
    const uniqueTemplateIds = [
      ...new Set(validGroupData.map((group) => group.templateId)),
    ];
    const templateNamePromises = uniqueTemplateIds.map(async (templateId) => {
      if (!templateNames[templateId]) {
        try {
          const response = await axios.get(
            `https://whatsapp.copartner.in/api/templates/${templateId}`
          );
          return { [templateId]: response.data.name }; // Assuming template name is in response.data.name
        } catch (error) {
          console.error(`Error fetching template ${templateId}:`, error);
          return { [templateId]: "Unknown Template" }; // Fallback for errors
        }
      }
      return {};
    });

    try {
      const templateNameResults = await Promise.all(templateNamePromises);
      const names = templateNameResults.reduce(
        (acc, result) => ({ ...acc, ...result }),
        {}
      );
      setTemplateNames((prev) => ({ ...prev, ...names }));
    } catch (error) {
      console.error("Error fetching template names:", error);
      toast.error("Failed to fetch some template names.");
    }
  };

  // Use Effect to fetch data on component mount
  useEffect(() => {
    fetchScheduleData();
  }, []); // Empty dependency array ensures this runs once on mount

  // Ensure groupData is an array and access the actual data array
  const validGroupData = Array.isArray(schedulingData) ? schedulingData : [];

  // Group schedules by groupName and sort by `scheduledTime`
  const groupedData = useMemo(() => {
    return validGroupData.reduce((acc, group) => {
      // Check if groupId exists and has groupName
      if (group.groupId && group.groupId.groupName) {
        if (!acc[group.groupId.groupName]) {
          acc[group.groupId.groupName] = [];
        }
        acc[group.groupId.groupName].push(group);
      } else {
        console.warn(
          `Missing groupId or groupName for group with id: ${group._id}`
        );
      }
      return acc;
    }, {});
  }, [validGroupData]);

  // Sort schedules by `scheduledTime` within each group
  const sortedGroupedData = useMemo(() => {
    return Object.entries(groupedData).map(([groupName, schedules]) => {
      const sortedSchedules = schedules.sort(
        (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)
      );
      return { groupName, schedules: sortedSchedules };
    });
  }, [groupedData]);

  // Fetch template names when scheduling data changes
  useEffect(() => {
    if (validGroupData.length > 0) {
      fetchTemplateNames(validGroupData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validGroupData]); // Removed dependency on fetchTemplateNames to prevent infinite loop

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
          updatedCountdowns[groupName] = calculateCountdown(
            earliestSchedule.scheduledTime
          );
        }
      });
      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedGroupedData]);

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
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
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
      fetchScheduleData(); // Refetch data after adding a schedule
    }
  };

  // Handle deletion of schedule
  const handleDeleteSchedule = async (scheduleId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this schedule?"
    );
    if (!confirmDelete) return;

    setIsDeleting(true); // Start deletion loading state

    try {
      await axios.delete(
        `https://whatsapp.copartner.in/api/schedule/${scheduleId}`
      );
      toast.success("Schedule deleted successfully");
      fetchScheduleData(); // Refetch data after deletion
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule.");
    } finally {
      setIsDeleting(false); // End deletion loading state
    }
  };

  // Calculate total pages based on sortedGroupedData
  const displayedGroupedData = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return sortedGroupedData.slice(startIdx, endIdx);
  }, [currentPage, rowsPerPage, sortedGroupedData]);

  return (
    <div className="py-6 px-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Schedule Listing</h2>
        <button
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
          onClick={() => setShowPopup(true)}
        >
          <FaPlus className="mr-2" />
          Add Schedule
        </button>
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]"> {/* Adjust based on total columns */}
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Group Name</th>
                <th className="text-left px-4 py-2">Scheduling Time</th>
                <th className="text-left px-4 py-2">Campaign Temp.</th>
                <th className="text-left px-4 py-2">Countdown</th>
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
                    {/* Optional: A spinner component */}
                  </td>
                </tr>
              ) : displayedGroupedData.length > 0 ? (
                displayedGroupedData.map(({ groupName, schedules }) => (
                  <React.Fragment key={groupName}>
                    {/* Group Row */}
                    <tr className="bg-gray-100">
                      <td className="px-4 py-2 font-semibold">
                        {schedules[0]?.groupId?.dateCreatedOn
                          ? new Date(schedules[0].groupId.dateCreatedOn).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {groupName || "Unnamed Group"}
                      </td>
                      <td className="px-4 py-2 font-semibold"></td>
                      <td className="px-4 py-2 font-semibold"></td>
                      <td className="px-4 py-2 font-semibold">
                        {countdowns[groupName] || "00:00"}
                      </td>
                      <td className="px-4 py-2 text-center font-semibold"></td>
                    </tr>
                    {/* Schedule Sub-Rows */}
                    {schedules.map((schedule) => {
                      const {
                        _id: scheduleId,
                        status,
                        templateId,
                        scheduledTime,
                      } = schedule;

                      return (
                        <tr key={scheduleId} className="hover:bg-gray-50 transition duration-200">
                          <td className="px-4 py-2"></td> {/* Empty cell for Date */}
                          <td className="px-4 py-2"></td> {/* Empty cell for Group Name */}
                          <td className="px-4 py-2">
                            {scheduledTime
                              ? new Date(scheduledTime).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            {templateNames[templateId] || "Fetching..."}
                          </td>
                          <td className="px-4 py-2">
                            {status === "sent"
                              ? calculateCountdown(scheduledTime)
                              : "00:00"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              className={`flex items-center justify-center bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200 ${
                                isDeleting ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              onClick={() => handleDeleteSchedule(scheduleId)}
                              disabled={isDeleting}
                              aria-label="Delete Schedule"
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center px-4 py-8 text-gray-500"
                  >
                    No schedules available.
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

      {/* Popup for adding new schedule */}
      {showPopup && (
        <CreateSchedule
          closePopup={handleClosePopup}
          fetchScheduleData={fetchScheduleData}
        />
      )}
    </div>
  );
};

export default Scheduling;
