// MarketingContentPopup.js

import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import close from "../../assets/close.png";
import select from "../../assets/+ Add Currency.png";
import { toast } from "react-toastify";

function MarketingContentPopup({ onClose, contentType, onSave }) {
  const [loading, setLoading] = useState(false);
  const [inputLabel, setInputLabel] = useState("");
  const [contentName, setContentName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState("home");

  useEffect(() => {
    setInputLabel(contentType === "Banner" ? "Banner Name" : "Video Name");
  }, [contentType]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!contentName.trim() || !selectedFile || !selectedType) {
      alert("Please fill out all fields");
      return;
    }

    let imageurl = "";

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);

      const uploadResponse = await fetch(
        `https://copartners.in:5134/api/AWSStorage?prefix=Images`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }
      const uploadData = await uploadResponse.json();
      imageurl = uploadData.data.presignedUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Failed to upload image`);
      return;
    } finally {
      setLoading(false);
    }

    // Prepare the payload
    const marketingContentData = {
      type: selectedType,
      imageurl: imageurl,
      name: contentName,
    };

    try {
      setLoading(true);
      const saveResponse = await fetch(
        "https://poster.copartner.in/api/banner",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(marketingContentData),
        }
      );

      if (!saveResponse.ok) {
        throw new Error("Error saving data");
      }

      const result = await saveResponse.json();
      onSave(result);
      setContentName("");
      setSelectedFile(null);
      setSelectedType("home");
      onClose();
      toast.success("Banner added successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFileClick = () => {
    document.getElementById("file-upload").click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="popup bg-white border-1 border-[#ffffff2a] m-4 rounded-lg w-3/4 text-center">
        <div className="bg-[#dddddd] px-4 py-2 rounded-t-lg flex justify-between">
          <h2 className="text-left font-semibold text-2xl">
            Add {contentType}
          </h2>
          <button onClick={onClose}>
            <img className="w-8 h-8 mr-4" src={close} alt="Close" />
          </button>
        </div>
        <div className="font-semibold text-2xl px-12 py-4 flex gap-12 text-left">
          <div className="flex flex-col gap-4">
            <label htmlFor="file-upload">Upload Title Image</label>
            <img
              className={`w-96 ${selectedFile ? "h-56" : ""} cursor-pointer`}
              src={selectedFile ? URL.createObjectURL(selectedFile) : select}
              alt="Select"
              onClick={handleSelectFileClick}
            />
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {/* Dropdown for type selection */}
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type-select"
                value={selectedType}
                onChange={handleTypeChange}
                label="Type"
              >
                <MenuItem value="home">Home</MenuItem>
                <MenuItem value="webinar">Webinar</MenuItem>
                <MenuItem value="course">Course</MenuItem>
              </Select>
            </FormControl>

            <div className="relative flex flex-col w-1/2">
              <TextField
                id="content-name"
                label={inputLabel}
                value={contentName}
                onChange={(e) => setContentName(e.target.value)}
                variant="outlined"
                fullWidth
                required
              />
            </div>
          </div>
        </div>
        <button
          className={`px-12 ${
            loading ? "bg-blue-300" : "bg-blue-500"
          }  text-white py-2 border-2 rounded-lg mb-8`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Adding" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default MarketingContentPopup;
