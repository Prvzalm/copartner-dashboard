// src/components/CreateSchedule.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // For API calls
import DatePicker from 'react-datepicker'; // For calendar date & time picking
import 'react-datepicker/dist/react-datepicker.css';
import { FaTimes } from 'react-icons/fa'; // Close icon
import { toast } from 'react-toastify'; // For notifications
import Select from 'react-select'; // For searchable dropdowns
import Spinner from './Spinner'; // Optional: A spinner component for loading states

const CreateSchedule = ({ closePopup, fetchScheduleData }) => {
  const [groupOptions, setGroupOptions] = useState([]);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // For date and time selection
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [groupPage, setGroupPage] = useState(1);
  const [templatePage, setTemplatePage] = useState(1);
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const [hasMoreTemplates, setHasMoreTemplates] = useState(true);

  // Fetch groups from the API with pagination and search
  const fetchGroups = async (page = 1, search = '') => {
    setIsLoadingGroups(true);
    try {
      const response = await axios.get(`https://whatsapp.copartner.in/api/groups`, {
        params: { page, search },
      });
      const fetchedGroups = response.data;

      if (fetchedGroups.length < 100) { // Assuming 100 is the page size
        setHasMoreGroups(false);
      }

      const formattedGroups = fetchedGroups.map(group => ({
        value: group._id,
        label: group.groupName,
      }));

      setGroupOptions(prev => [...prev, ...formattedGroups]);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups.');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Fetch templates from the API with pagination and search
  const fetchTemplates = async (page = 1, search = '') => {
    setIsLoadingTemplates(true);
    try {
      const response = await axios.get(`https://whatsapp.copartner.in/api/templates`, {
        params: { page, search },
      });
      const fetchedTemplates = response.data;

      if (fetchedTemplates.length < 100) { // Assuming 100 is the page size
        setHasMoreTemplates(false);
      }

      const formattedTemplates = fetchedTemplates.map(template => ({
        value: template._id,
        label: template.name,
      }));

      setTemplateOptions(prev => [...prev, ...formattedTemplates]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates.');
    } finally {
      setIsLoadingTemplates(false);
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
    if (!selectedGroup || !selectedTemplate || !selectedDate) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('https://whatsapp.copartner.in/api/schedule', {
        groupId: selectedGroup.value,
        templateId: selectedTemplate.value,
        scheduledTime: selectedDate,
        status: 'pending', // Assuming status is pending initially
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Schedule created successfully.');
        closePopup(true); // Close popup and trigger data refresh
      } else {
        throw new Error('Failed to create schedule.');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('An error occurred while creating the schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load more groups when reaching the end of the current options
  const loadMoreGroups = () => {
    if (hasMoreGroups && !isLoadingGroups) {
      const nextPage = groupPage + 1;
      fetchGroups(nextPage);
      setGroupPage(nextPage);
    }
  };

  // Load more templates when reaching the end of the current options
  const loadMoreTemplates = () => {
    if (hasMoreTemplates && !isLoadingTemplates) {
      const nextPage = templatePage + 1;
      fetchTemplates(nextPage);
      setTemplatePage(nextPage);
    }
  };

  // Handle group search
  const handleGroupSearch = (inputValue) => {
    setGroupPage(1);
    setGroupOptions([]);
    setHasMoreGroups(true);
    fetchGroups(1, inputValue);
  };

  // Handle template search
  const handleTemplateSearch = (inputValue) => {
    setTemplatePage(1);
    setTemplateOptions([]);
    setHasMoreTemplates(true);
    fetchTemplates(1, inputValue);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => closePopup(false)}
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Create Schedule</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onInputChange={handleGroupSearch}
              isLoading={isLoadingGroups}
              isClearable
              placeholder="Select a Group..."
              noOptionsMessage={() => hasMoreGroups ? "Type to search..." : "No more groups"}
              onMenuScrollToBottom={loadMoreGroups}
              classNamePrefix="react-select"
            />
          </div>

          {/* Template Name Dropdown */}
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
              Template Name<span className="text-red-500">*</span>
            </label>
            <Select
              id="template"
              name="template"
              options={templateOptions}
              value={selectedTemplate}
              onChange={setSelectedTemplate}
              onInputChange={handleTemplateSearch}
              isLoading={isLoadingTemplates}
              isClearable
              placeholder="Select a Template..."
              noOptionsMessage={() => hasMoreTemplates ? "Type to search..." : "No more templates"}
              onMenuScrollToBottom={loadMoreTemplates}
              classNamePrefix="react-select"
            />
          </div>

          {/* Date and Time Picker */}
          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Date and Time<span className="text-red-500">*</span>
            </label>
            <DatePicker
              id="scheduledTime"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              timeIntervals={15}
              dateFormat="Pp"
              placeholderText="Select Date and Time"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              minDate={new Date()} // Prevent selecting past dates
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className={`flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
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

        {/* CreateTemplate Popup (if needed) */}
        {/* <CreateTemplate /> */}
      </div>
    </div>
  );
};

export default CreateSchedule;
