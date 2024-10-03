import React, { useState } from "react";
import axios from "axios";

const UploadPopup = ({ onClose, fetchPosters }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("1"); // Default to "Blur"
  const [loading, setLoading] = useState(false);

  const handleImage1Change = (e) => {
    setImage1(e.target.files[0]);
  };

  const handleImage2Change = (e) => {
    setImage2(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images to S3
      const image1Url = await uploadToS3(image1);
      const image2Url = await uploadToS3(image2);

      // Post data including image URLs, type, and name
      const postData = {
        image1url: image1Url,
        image2url: image2Url,
        type,
        name,
      };

      console.log(postData);

      await axios.post(
        "https://poster.copartner.in/api/admin/poster",
        postData
      );

      onClose();
      fetchPosters(); // Close the popup after successful upload
    } catch (err) {
      console.error("Error uploading files", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadToS3 = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(
      "https://copartners.in:5134/api/AWSStorage?prefix=Posters",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const { presignedUrl } = response.data.data;
    return presignedUrl;
  };

  return (
    <div className="popup-overlay fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="popup-content bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Upload New Poster
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image 1
            </label>
            <input
              type="file"
              onChange={handleImage1Change}
              required
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image 2
            </label>
            <input
              type="file"
              onChange={handleImage2Change}
              required
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="block w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="1">Blur</option>
              <option value="2">Marketing</option>
              <option value="3">Premium</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-red-500 text-white p-2 rounded-lg"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-blue-500 text-white p-2 rounded-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPopup;
