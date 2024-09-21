import React, { useState } from 'react';
import axios from 'axios'; // For making API requests

const CreateTemplate = ({ closePopup }) => {
  const [templateData, setTemplateData] = useState({
    name: '',
    apiUrl: 'https://backend.aisensy.com/campaign/t1/api/v2', // Default API URL
    apiKey: '',
    campaignName: '',
    userName: '',
    templateParams: [], // Array to hold multiple template parameters
    mediaUrl: '',
    mediaFilename: '',
    source: 'new-landing-page form', // Default value
  });

  const [newParam, setNewParam] = useState(''); // For new template parameter
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change for the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add new template param
  const handleAddParam = () => {
    if (newParam.trim()) {
      setTemplateData((prev) => ({
        ...prev,
        templateParams: [...prev.templateParams, newParam],
      }));
      setNewParam(''); // Clear input after adding
    }
  };

  // Remove a template parameter
  const handleRemoveParam = (index) => {
    setTemplateData((prev) => ({
      ...prev,
      templateParams: prev.templateParams.filter((_, i) => i !== index),
    }));
  };

  // Validate template data before submission
  const validateTemplateData = () => {
    const { name, apiKey, campaignName, userName } = templateData;
    if (!name || !apiKey || !campaignName || !userName) {
      alert('Please fill in all required fields.');
      return false;
    }
    return true;
  };

  // Submit the template data to the backend
  const handleSubmit = async () => {
    if (!validateTemplateData()) return; // Validate form inputs

    setIsSubmitting(true);

    try {
      const response = await axios.post('https://whatsapp.copartner.in/api/templates', templateData);
      if (response.status === 200) {
        alert('Template saved successfully');
        closePopup(); // Close the popup after success
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('An error occurred while saving the template');
    } finally {
      setIsSubmitting(false); // Reset the loading state
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md relative">
        {/* Close (Cross) Button */}
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6">Create Template</h2>

        {/* Template Form Fields */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={templateData.name}
            onChange={handleInputChange}
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">API Key</label>
          <input
            type="text"
            name="apiKey"
            value={templateData.apiKey}
            onChange={handleInputChange}
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
          <input
            type="text"
            name="campaignName"
            value={templateData.campaignName}
            onChange={handleInputChange}
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">User Name</label>
          <input
            type="text"
            name="userName"
            value={templateData.userName}
            onChange={handleInputChange}
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Template Params Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Template Params</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newParam}
              onChange={(e) => setNewParam(e.target.value)}
              placeholder="Add template parameter"
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
              onClick={handleAddParam}
              disabled={isSubmitting}
            >
              Add
            </button>
          </div>

          {/* List of added params */}
          <ul className="list-disc pl-5">
            {templateData.templateParams.map((param, index) => (
              <li key={index} className="mb-2">
                {param}
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                  onClick={() => handleRemoveParam(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Media URL</label>
          <input
            type="text"
            name="mediaUrl"
            value={templateData.mediaUrl}
            onChange={handleInputChange}
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Media Filename</label>
          <input
            type="text"
            name="mediaFilename"
            value={templateData.mediaFilename}
            onChange={handleInputChange}
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Template'}
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none"
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

export default CreateTemplate;
