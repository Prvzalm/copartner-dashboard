import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For API calls
import DatePicker from 'react-datepicker'; // For calendar date & time picking
import 'react-datepicker/dist/react-datepicker.css';
import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa'; // Icons
import { toast } from 'react-toastify'; // For notifications
import Select from 'react-select'; // For searchable dropdowns

const CreateSchedule = ({ closePopup, fetchScheduleGroupData }) => {
  const [groupOptions, setGroupOptions] = useState([]);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [schedules, setSchedules] = useState([
    { selectedTemplate: null, selectedDate: null },
  ]); // Array of schedules
  const [scheduleName, setScheduleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch groups from the API
  const fetchGroups = async () => {
    try {
      const response = await axios.get('https://whatsapp.copartner.in/api/groups');
      const formattedGroups = response.data.map(group => ({
        value: group._id,
        label: group.groupName,
      }));
      setGroupOptions(formattedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups.');
    }
  };

  // Fetch templates from the API
  const fetchTemplates = async () => {
    try {
      const response = await axios.get('https://whatsapp.copartner.in/api/templates');
      const formattedTemplates = response.data.map(template => ({
        value: template._id,
        label: template.name,
      }));
      setTemplateOptions(formattedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates.');
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchGroups();
    fetchTemplates();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!scheduleName || !selectedGroup || schedules.length === 0) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Validate each schedule entry
    for (let i = 0; i < schedules.length; i++) {
      const { selectedTemplate, selectedDate } = schedules[i];
      if (!selectedTemplate || !selectedDate) {
        toast.error(`Please fill in all fields for schedule ${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare schedules data
      const schedulesData = schedules.map(({ selectedTemplate, selectedDate }) => ({
        templateId: selectedTemplate.value,
        scheduledTime: selectedDate,
      }));

      const payload = {
        scheduleName,
        groupId: selectedGroup.value,
        schedules: schedulesData,
      };

      const response = await axios.post('https://whatsapp.copartner.in/api/schedule-groups', payload);

      console.log('Response from server:', response);

      // No need to check response.status, if the request didn't throw an error, it was successful
      toast.success('Schedule group created successfully.');
      closePopup(true); // Close popup and trigger data refresh
      fetchScheduleGroupData(); // Refresh data

    } catch (error) {
      console.error('Error creating schedule group:', error);

      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Server responded with:', error.response.data);
        toast.error(`Error: ${error.response.data.message || 'An error occurred while creating the schedule group.'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('No response from the server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding a new schedule
  const handleAddSchedule = () => {
    setSchedules([...schedules, { selectedTemplate: null, selectedDate: null }]);
  };

  // Handle removing a schedule
  const handleRemoveSchedule = (index) => {
    const updatedSchedules = schedules.filter((_, idx) => idx !== index);
    setSchedules(updatedSchedules);
  };

  // Handle change in a schedule entry
  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index][field] = value;
    setSchedules(updatedSchedules);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative max-h-[80vh] overflow-y-auto">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => closePopup(false)}
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Create Schedule Group</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Schedule Group Name */}
          <div>
            <label htmlFor="scheduleName" className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Group Name<span className="text-red-500">*</span>
            </label>
            <input
              id="scheduleName"
              type="text"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter Schedule Group Name"
              required
            />
          </div>

          {/* Group Name Dropdown */}
          <div>
            <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name<span className="text-red-500">*</span>
            </label>
            <Select
              id="group"
              name="group"
              options={groupOptions}
              value={selectedGroup}
              onChange={setSelectedGroup}
              isClearable
              placeholder="Select a Group..."
              classNamePrefix="react-select"
            />
          </div>

          {/* Schedule Entries */}
          {schedules.map((schedule, index) => (
            <div key={index} className="border p-4 rounded-md relative">
              {schedules.length > 1 && (
                <button
                  type="button"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveSchedule(index)}
                  aria-label="Remove Schedule"
                >
                  <FaMinus size={16} />
                </button>
              )}
              <h3 className="text-lg font-semibold mb-2">Schedule {index + 1}</h3>
              {/* Template Name Dropdown */}
              <div>
                <label htmlFor={`template-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name<span className="text-red-500">*</span>
                </label>
                <Select
                  id={`template-${index}`}
                  name={`template-${index}`}
                  options={templateOptions}
                  value={schedule.selectedTemplate}
                  onChange={(value) => handleScheduleChange(index, 'selectedTemplate', value)}
                  isClearable
                  placeholder="Select a Template..."
                  classNamePrefix="react-select"
                />
              </div>

              {/* Date and Time Picker */}
              <div className="mt-4">
                <label htmlFor={`scheduledTime-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Date and Time<span className="text-red-500">*</span>
                </label>
                <DatePicker
                  id={`scheduledTime-${index}`}
                  selected={schedule.selectedDate}
                  onChange={(date) => handleScheduleChange(index, 'selectedDate', date)}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="Pp"
                  placeholderText="Select Date and Time"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  minDate={new Date()} // Prevent selecting past dates
                />
              </div>
            </div>
          ))}

          {/* Add Schedule Button */}
          <div className="flex justify-center">
            <button
              type="button"
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
              onClick={handleAddSchedule}
            >
              <FaPlus className="mr-2" />
              Add Another Schedule
            </button>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className={`flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Add'}
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
              onClick={() => closePopup(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateSchedule;
