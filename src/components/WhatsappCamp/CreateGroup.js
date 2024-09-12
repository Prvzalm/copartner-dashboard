import React, { useState } from 'react';

const CreateGroup = ({ selectedUsers, closePopup }) => {
  const [groupName, setGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // To handle the loading state

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    setIsSubmitting(true); // Set loading state

    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers, // Pass the selected user IDs
          groupName: groupName.trim(), // Pass the trimmed group name
        }),
      });

      if (response.ok) {
        alert('Group name updated successfully');
        closePopup(); // Close the popup after a successful patch request
      } else {
        const errorData = await response.json();
        alert(`Failed to update group name: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating group name:', error);
      alert('An error occurred while updating the group name');
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg w-1/3 relative">
        <h2 className="text-2xl font-bold mb-4">Create Group</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            disabled={isSubmitting} // Disable input during submission
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting} // Disable button during submission
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
          <button
            className="bg-gray-500 text-white p-2 rounded-md"
            onClick={closePopup}
            disabled={isSubmitting} // Disable cancel button during submission
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
