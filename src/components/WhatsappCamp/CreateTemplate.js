// src/components/CreateTemplate.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For making API requests
import DatePicker from 'react-datepicker'; // If needed for date inputs
import 'react-datepicker/dist/react-datepicker.css';
import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa'; // Icons for UI
import { toast } from 'react-toastify'; // For notifications
import Select from 'react-select'; // For dropdowns

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined parameter options
  const paramOptions = [
    { value: '$UserName', label: 'UserName' },
    { value: '$RaName', label: 'RaName' },
    { value: 'Custom', label: 'Custom' },
  ];

  // Handle input change for the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new template parameter
  const handleAddParam = () => {
    setTemplateData((prev) => ({
      ...prev,
      templateParams: [
        ...prev.templateParams,
        { paramType: '', paramValue: '' }, // Initialize with empty values
      ],
    }));
  };

  // Remove a template parameter
  const handleRemoveParam = (index) => {
    setTemplateData((prev) => ({
      ...prev,
      templateParams: prev.templateParams.filter((_, i) => i !== index),
    }));
  };

  // Handle change in a specific template parameter
  const handleParamChange = (index, field, value) => {
    const updatedParams = [...templateData.templateParams];
    updatedParams[index][field] = value;

    // If paramType is not Custom, clear paramValue
    if (field === 'paramType' && value !== 'Custom') {
      updatedParams[index]['paramValue'] = '';
    }

    setTemplateData((prev) => ({
      ...prev,
      templateParams: updatedParams,
    }));
  };

  // Validate template data before submission
  const validateTemplateData = () => {
    const { name, apiKey, campaignName, userName, templateParams } = templateData;
    if (!name || !apiKey || !campaignName || !userName) {
      toast.error('Please fill in all required fields.');
      return false;
    }

    // Validate each template parameter
    for (let i = 0; i < templateParams.length; i++) {
      const { paramType, paramValue } = templateParams[i];
      if (!paramType) {
        toast.error(`Please select a parameter type for Param${i + 1}.`);
        return false;
      }
      if (paramType === 'Custom' && !paramValue.trim()) {
        toast.error(`Please enter a value for Param${i + 1}.`);
        return false;
      }
    }

    return true;
  };

  // Submit the template data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateTemplateData()) return; // Validate form inputs

    setIsSubmitting(true);

    try {
      // Assign Param1, Param2, etc., based on the order
      const formattedParams = templateData.templateParams.map((param, index) => {
        let value = '';
        if (param.paramType === 'Custom') {
          value = param.paramValue;
        } else {
          value = param.paramType;
        }
        return `Param${index + 1}: ${value}`;
      });

      const payload = {
        name: templateData.name,
        apiUrl: templateData.apiUrl,
        apiKey: templateData.apiKey,
        campaignName: templateData.campaignName,
        userName: templateData.userName,
        templateParams: formattedParams,
        mediaUrl: templateData.mediaUrl,
        mediaFilename: templateData.mediaFilename,
        source: templateData.source,
      };

      const response = await axios.post('https://whatsapp.copartner.in/api/templates', payload);

      if (response.status === 200 || response.status === 201) {
        toast.success('Template saved successfully');
        closePopup(); // Close the popup after success
      } else {
        toast.error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('An error occurred while saving the template');
    } finally {
      setIsSubmitting(false); // Reset the loading state
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl relative overflow-y-auto max-h-screen">
        {/* Close (Cross) Button */}
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Create Template</h2>

        {/* Template Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={templateData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Template Name"
              required
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="apiKey"
              value={templateData.apiKey}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter API Key"
              required
            />
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="campaignName"
              value={templateData.campaignName}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Campaign Name"
              required
            />
          </div>

          {/* User Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">User Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="userName"
              value={templateData.userName}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter User Name"
              required
            />
          </div>

          {/* Template Params Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Template Params</label>
            <div className="space-y-4">
              {templateData.templateParams.map((param, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {/* Dropdown to select param type */}
                  <Select
                    options={paramOptions}
                    value={paramOptions.find(option => option.value === param.paramType) || null}
                    onChange={(selectedOption) => handleParamChange(index, 'paramType', selectedOption.value)}
                    placeholder="Select Param Type"
                    className="w-1/3"
                  />

                  {/* Input for custom param if 'Custom' is selected */}
                  {param.paramType === 'Custom' && (
                    <input
                      type="text"
                      value={param.paramValue}
                      onChange={(e) => handleParamChange(index, 'paramValue', e.target.value)}
                      placeholder="Enter Custom Param"
                      className="w-2/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  )}

                  {/* Remove Param Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveParam(index)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                    aria-label={`Remove Param ${index + 1}`}
                  >
                    <FaMinus />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Param Button */}
            <button
              type="button"
              onClick={handleAddParam}
              className="mt-4 flex items-center text-blue-500 hover:text-blue-700 focus:outline-none"
            >
              <FaPlus className="mr-2" />
              Add Parameter
            </button>
          </div>

          {/* Media URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Media URL</label>
            <input
              type="text"
              name="mediaUrl"
              value={templateData.mediaUrl}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Media URL"
            />
          </div>

          {/* Media Filename */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Media Filename</label>
            <input
              type="text"
              name="mediaFilename"
              value={templateData.mediaFilename}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Media Filename"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <input
              type="text"
              name="source"
              value={templateData.source}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Source"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Template'}
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none"
              onClick={() => closePopup()}
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

export default CreateTemplate;
