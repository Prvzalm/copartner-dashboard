import React, { useState, useEffect } from 'react';

const CreateGroup = ({ selectedUsers = [], closePopup }) => {
  const [groupName, setGroupName] = useState('');
  const [existingGroups, setExistingGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingGroupUsers, setExistingGroupUsers] = useState([]);

  useEffect(() => {
    // Fetch existing groups when the component mounts
    const fetchGroups = async () => {
      try {
        const response = await fetch('https://whatsapp.copartner.in/api/groups');
        if (response.ok) {
          const data = await response.json();
          setExistingGroups(data);
        } else {
          console.error('Failed to fetch groups');
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);

  // Fetch existing users when a group is selected
  useEffect(() => {
    const fetchGroupUsers = async () => {
      if (selectedGroupId) {
        try {
          const response = await fetch(`https://whatsapp.copartner.in/api/groups/${selectedGroupId}`);
          if (response.ok) {
            const data = await response.json();
            setExistingGroupUsers(data.users || []);
          } else {
            console.error('Failed to fetch group users');
            setExistingGroupUsers([]);
          }
        } catch (error) {
          console.error('Error fetching group users:', error);
          setExistingGroupUsers([]);
        }
      } else {
        setExistingGroupUsers([]);
      }
    };

    fetchGroupUsers();
  }, [selectedGroupId]);

  const handleSubmit = async () => {
    if (!selectedUsers || selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedGroupId) {
        // Merge existing users with new users, avoiding duplicates
        const combinedUsers = [...existingGroupUsers];

        selectedUsers.forEach((newUser) => {
          if (!combinedUsers.some((user) => user.userId === newUser.userId)) {
            combinedUsers.push({
              userId: newUser.userId,
              raName: newUser.raName,
              name: newUser.name,
              mobileNumber: newUser.mobileNumber,
            });
          }
        });

        // Send PATCH request with the combined users array
        const response = await fetch(`https://whatsapp.copartner.in/api/groups/${selectedGroupId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupName: existingGroups.find(group => group._id === selectedGroupId)?.groupName || '',
            users: combinedUsers,
          }),
        });

        if (response.ok) {
          alert('Users added to the existing group successfully');
          closePopup();
        } else {
          const errorData = await response.json();
          alert(`Failed to add users to the group: ${errorData.error}`);
        }
      } else {
        if (!groupName.trim()) {
          alert('Please enter a group name');
          setIsSubmitting(false);
          return;
        }

        const response = await fetch('https://whatsapp.copartner.in/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupName: groupName.trim(),
            users: selectedUsers.map((user) => ({
              userId: user.userId,
              raName: user.raName,
              name: user.name,
              mobileNumber: user.mobileNumber,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert(`Group created successfully with ID: ${data.group._id}`);
          closePopup();
        } else {
          const errorData = await response.json();
          alert(`Failed to create group: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('An error occurred while submitting the request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg w-1/3 relative">
        <h2 className="text-2xl font-bold mb-4">Create Group</h2>

        {/* Dropdown to select existing group */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Select Existing Group</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          >
            <option value="">-- Create New Group --</option>
            {existingGroups &&
              existingGroups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.groupName}
                </option>
              ))}
          </select>
        </div>

        {/* Show group name input only if creating a new group */}
        {!selectedGroupId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              disabled={isSubmitting}
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
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

export default CreateGroup;
