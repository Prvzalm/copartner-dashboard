// BannerAdmin.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import PageHeader from "../Header/Header";
import Bin from "../../assets/TrashBinMinimalistic.png";

const BannerAdmin = () => {
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNotification, setHasNotification] = useState(true);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "home",
    imageFile: null, // Changed from imageurl to imageFile
    name: "",
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  // Function to fetch banners from API
  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "https://poster.copartner.in/api/banner"
      );
      setBanners(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch banners. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setFormData({ ...formData, imageFile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Function to upload image to AWSStorage API
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("https://copartners.in:5134/api/AWSStorage?prefix=Images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.isSuccess) {
        return response.data.data.presignedUrl;
      } else {
        throw new Error(response.data.displayMessage || "Image upload failed.");
      }
    } catch (err) {
      throw new Error(
        err.response?.data?.displayMessage ||
          err.message ||
          "Image upload failed."
      );
    }
  };

  // Handle form submission to add a new banner
  const handleAddBanner = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!formData.type || !formData.imageFile || !formData.name) {
      setFormError("All fields are required.");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Upload the image and get the presigned URL
      const presignedUrl = await uploadImage(formData.imageFile);

      // Step 2: Create the banner with the obtained image URL
      const bannerPayload = {
        type: formData.type,
        imageurl: presignedUrl,
        name: formData.name,
      };

      const response = await axios.post(
        "https://poster.copartner.in/api/banner",
        bannerPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setBanners([...banners, response.data.data]);
      setShowModal(false);
      setFormData({
        type: "home",
        imageFile: null,
        name: "",
      });
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to add banner. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting a banner
  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      await axios.delete(`https://poster.copartner.in/api/banner/${id}`);
      setBanners(banners.filter((banner) => banner._id !== id));
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete banner. Please try again."
      );
    }
  };

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      {/* Page Header */}
      <PageHeader
        title="Banner Images"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setHasNotification={setHasNotification}
      />

      {/* Main Content */}
      <div className="px-4 mt-4">
        {/* Add Banner Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Banner
        </button>

        {/* Loading State */}
        {loading && <p>Loading banners...</p>}

        {/* Error State */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Banners List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners
            .filter((banner) =>
              banner.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((banner) => (
              <div
                key={banner._id}
                className="border rounded shadow p-4 relative"
              >
                <img
                  src={banner.imageurl}
                  alt={banner.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-semibold">{banner.name}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  Type: {banner.type}
                </p>
                <button
                  onClick={() => handleDeleteBanner(banner._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Delete Banner"
                >
                  <img
                    className="w-6 h-6 cursor-pointer"
                    src={Bin}
                    alt="Delete"
                  />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Add Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Banner</h2>
            {formError && <p className="text-red-500 mb-2">{formError}</p>}
            <form onSubmit={handleAddBanner}>
              {/* Type Field */}
              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                >
                  <option value="home">Home</option>
                  <option value="webinar">Webinar</option>
                  <option value="course">Course</option>
                </select>
              </div>

              {/* Image File Field */}
              <div className="mb-4">
                <label
                  htmlFor="imageFile"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Image File
                </label>
                <input
                  type="file"
                  id="imageFile"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>

              {/* Name Field */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  placeholder="Enter banner name"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 mr-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerAdmin;
