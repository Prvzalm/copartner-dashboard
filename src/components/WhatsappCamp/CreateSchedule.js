import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For API calls
import DatePicker from 'react-datepicker'; // For calendar date & time picking
import 'react-datepicker/dist/react-datepicker.css';

const CreateSchedule = ({ closePopup }) => {
  const [groupName, setGroupName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedDate, setSelectedDate] = useState(null); // For date and time selection
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupPage, setGroupPage] = useState(1);
  const [templatePage, setTemplatePage] = useState(1);

  // Fetch groups from the API
  const fetchGroups = async () => {
    try {
      const response = await axios.get(`https://whatsapp.copartner.in/api/groups?page=${groupPage}&limit=5`);
      setGroups((prev) => [...prev, ...response.data]); // Append new groups
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Fetch templates from the API
  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`https://whatsapp.copartner.in/api/templates?page=${templatePage}&limit=5`);
      setTemplates((prev) => [...prev, ...response.data]); // Append new templates
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!groupId || !templateId || !selectedDate) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('https://whatsapp.copartner.in/api/schedule', {
        groupId,
        templateId,
        scheduledTime: selectedDate,
        status: 'pending', // Assuming status is pending initially
      });

      if (response.status === 200) {
        alert('Schedule created successfully');
        closePopup();
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('An error occurred while creating the schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchGroups();
    fetchTemplates();
  }, [groupPage, templatePage]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg w-1/3 relative">
        <h2 className="text-2xl font-bold mb-4">Create Schedule</h2>

        {/* Group Name Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Group Name</label>
          <div className="relative">
            <select
              className="block w-full p-2 border border-gray-300 rounded-md"
              value={groupId}
              onChange={(e) => {
                const selectedGroup = groups.find(group => group._id === e.target.value);
                setGroupId(selectedGroup._id);
                setGroupName(selectedGroup.groupName);
              }}
            >
              <option value="">Select a Group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.groupName}
                </option>
              ))}
            </select>
            
          </div>
        </div>

        {/* Template Name Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Template Name</label>
          <div className="relative">
            <select
              className="block w-full p-2 border border-gray-300 rounded-md"
              value={templateId}
              onChange={(e) => {
                const selectedTemplate = templates.find(template => template._id === e.target.value);
                setTemplateId(selectedTemplate._id);
                setTemplateName(selectedTemplate.name);
              }}
            >
              <option value="">Select a Template</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
            
          </div>
        </div>

        {/* Date and Time Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Schedule Date and Time</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholderText="Select Date and Time"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button
            className="bg-gray-500 text-white p-2 rounded-md"
            onClick={closePopup}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSchedule;
