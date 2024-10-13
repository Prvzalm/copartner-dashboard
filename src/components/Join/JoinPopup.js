import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import close from "../../assets/close.png";

const JoinPopup = ({ closeJoin, fetchChannels }) => {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [availableLinks, setAvailableLinks] = useState([]);

  useEffect(() => {
    fetchChannelData();
  }, []);

  const fetchChannelData = async () => {
    try {
      const response = await axios.get(
        "https://phonepe.copartner.in/api/getChannelData"
      );
      setChannels(response.data);
    } catch (error) {
      console.error("Error fetching channel data:", error);
      toast.error("Failed to fetch channel data");
    }
  };

  const handleChannelChange = (event) => {
    const selectedChatId = event.target.value;
    const selectedChannel = channels.find(
      (channel) => channel.chatId === selectedChatId
    );
    setSelectedChannel(selectedChatId);
    setName(selectedChannel ? selectedChannel.channelName : "");
    setAvailableLinks(selectedChannel ? selectedChannel.links : []);
  };

  const handleAddChannel = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://phonepe.copartner.in/api/joinBotChannel",
        {
          chatId: selectedChannel,
          channelName: name,
          telegramLink: link,
        }
      );
      if (response.status !== 200) {
        throw new Error(toast.error(response.data.error));
      }
      closeJoin();
      toast.success(response.data.message);
      fetchChannels();
    } catch (error) {
      console.error("Error adding channel:", error);
      toast.error("Failed to add channel");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="popup bg-white border-1 border-[#ffffff2a] m-4 rounded-lg w-3/4 text-center">
        <div className="bg-[#dddddd] px-4 py-2 rounded-t-lg flex justify-between items-center">
          <h2 className="text-left font-semibold text-2xl">Add Channel</h2>
          <div className="flex items-center">
            <button onClick={closeJoin}>
              <img className="w-8 h-8" src={close} alt="close" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleAddChannel}
          className="px-12 py-4 grid grid-cols-2 my-4 gap-8 text-left"
        >
          <FormControl variant="outlined" fullWidth required>
            <InputLabel id="select-channel-label">Channel Name</InputLabel>
            <Select
              labelId="select-channel-label"
              id="select-channel"
              value={selectedChannel}
              onChange={handleChannelChange}
              label="Channel Name"
            >
              {channels.map((channel) => (
                <MenuItem key={channel._id} value={channel.chatId}>
                  {channel.channelName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" fullWidth required>
            <InputLabel id="select-link-label">Link</InputLabel>
            <Select
              labelId="select-link-label"
              id="select-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              label="Link"
              disabled={availableLinks.length === 0}
            >
              {availableLinks.map((link, index) => (
                <MenuItem key={index} value={link}>
                  {link}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <button className="col-span-2 px-12 bg-blue-500 text-white py-2 mb-8 border-2 rounded-lg">
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinPopup;
