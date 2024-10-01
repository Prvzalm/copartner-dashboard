import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const InstantMessage = ({ isOpen, onClose, groupId }) => {
  const [scheduleName, setScheduleName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch templates when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setScheduledTime(getCurrentISTDateTimeLocal());
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('https://whatsapp.copartner.in/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Function to get current IST time in 'YYYY-MM-DDTHH:MM' format
  const getCurrentISTDateTimeLocal = () => {
    const now = new Date();
    // IST offset is +5:30 from UTC
    const istOffset = 5.5 * 60; // IST offset in minutes
    const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
    const year = istTime.getUTCFullYear();
    const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istTime.getUTCDate()).padStart(2, '0');
    const hours = String(istTime.getUTCHours()).padStart(2, '0');
    const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scheduleName || !templateId || !scheduledTime) {
      alert('Please fill all fields.');
      return;
    }

    if (!groupId) {
      alert('No group selected.');
      return;
    }

    setIsSubmitting(true);

    // Since scheduledTime is in IST, convert it to UTC before creating ISO string
    const scheduledDate = new Date(scheduledTime);
    // Adjust for IST offset
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const utcScheduledDate = new Date(scheduledDate.getTime() - istOffset);
    const scheduledTimeISO = utcScheduledDate.toISOString();

    const payload = {
      scheduleName,
      groupId: groupId, // Single groupId
      schedules: [
        {
          templateId,
          scheduledTime: scheduledTimeISO,
        },
      ],
    };

    try {
      const response = await fetch('https://whatsapp.copartner.in/api/schedule-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers if required
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Schedule created successfully.');
        onClose(); // Close the modal
      } else {
        const errorData = await response.json();
        alert('Error creating schedule: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Error creating schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Simple modal implementation; consider using a library for better UX
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create Instant Message Schedule</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Schedule Name:</label>
            <input
              type="text"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Template:</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Template</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Scheduled Time (IST):</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

InstantMessage.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  groupId: PropTypes.string.isRequired,
};

export default InstantMessage;
