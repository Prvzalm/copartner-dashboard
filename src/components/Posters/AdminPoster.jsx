import axios from "axios";
import React, { useEffect, useState } from "react";
import UploadPopup from "./UploadPopup"; // Import the popup component
import ImagePopup from "./ImagePopup"; // Import the new image popup component

const AdminPoster = ({ searchQuery }) => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false); // Manage upload popup state
  const [selectedImage, setSelectedImage] = useState(null); // Manage selected image state

  const fetchPosters = async () => {
    try {
      const response = await axios.get(
        "https://poster.copartner.in/api/admin/posters"
      );
      setPosters(response.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load posters");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl); // Set the selected image when clicked
  };

  const closeImagePopup = () => {
    setSelectedImage(null); // Close the popup
  };

  const handleUploadClick = () => {
    setIsUploadOpen(true);
  };

  const closeUploadPopup = () => {
    setIsUploadOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const filteredPosters = posters.filter((poster) =>
    poster.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-4 px-8">
      <button
        className="mb-4 p-2 bg-blue-500 text-white rounded"
        onClick={handleUploadClick}
      >
        Upload Poster
      </button>

      {isUploadOpen && <UploadPopup onClose={closeUploadPopup} fetchPosters={fetchPosters} />} {/* Show popup */}

      {selectedImage && <ImagePopup imageUrl={selectedImage} onClose={closeImagePopup} />} {/* Show image popup */}

      <div className="grid grid-cols-3 gap-8">
        {filteredPosters.length > 0 ? (
          filteredPosters.map((poster) => (
            <div key={poster._id} className="poster-item">
              <h3>{poster.name}</h3>
              <img
                src={poster.image1url}
                alt={poster.name}
                style={{ maxWidth: "100%" }}
                onClick={() => handleImageClick(poster.image2url)} // Open popup on click
                className="cursor-pointer"
              />
            </div>
          ))
        ) : (
          <div>No posters found</div>
        )}
      </div>
    </div>
  );
};

export default AdminPoster;
