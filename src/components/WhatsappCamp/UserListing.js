import React, { useState } from 'react';
import CreateGroup from './CreateGroup';

const UserListing = ({ apDetails }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // Helper function to map serviceType values to corresponding strings
  const mapServiceType = (serviceType) => {
    switch (serviceType) {
      case '1':
        return 'Commodity';
      case '2':
        return 'Equity';
      case '3':
        return 'F&O';
      default:
        return 'Unknown';
    }
  };

  const handleCheckboxChange = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const rowsPerPage = 100; // Set the number of rows per page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the total number of pages, handling empty or undefined data gracefully
  const totalPages = apDetails && apDetails.length ? Math.ceil(apDetails.length / rowsPerPage) : 1;

  // Get the data for the current page, handling empty or undefined data
  const currentData = apDetails && apDetails.length
    ? apDetails.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : [];

  // Handle pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="py-4 px-8">
      <div className="table-container overflow-x-auto">
        <h2 className="pl-3 text-xl font-semibold">User Listing</h2>
        <div className="flex justify-end space-x-4">
          <button className="border rounded-lg border-black p-2">Send Message</button>
          <button
            className="border rounded-lg border-black p-2"
            onClick={() => setShowPopup(true)}
          >
            Create Group
          </button>
          <button className="border rounded-lg border-black p-2">Filter</button>
        </div>

        <table className="table-list min-w-max">
          <thead>
            <tr className="requestColumns">
              <th style={{ textAlign: 'left', paddingLeft: '2rem' }}>
                <input type="checkbox" onChange={() => {}} />
              </th>
              <th style={{ textAlign: 'left', paddingLeft: '2rem' }}>Date</th>
              <th style={{ textAlign: 'left' }}>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>isKYC</th>
              <th>ReferralMode</th>
              <th>Landing URL</th>
              <th>RA Name</th>
              <th>Amount</th>
              <th>Subscription Name</th>
              <th>Sub.Type</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((apdetail) => {
                const hasMultipleSubscriptions = apdetail.subscriptions && apdetail.subscriptions.length > 1;

                return (
                  <React.Fragment key={apdetail.id}>
                    <tr className="request-numbers font-semibold">
                      <td
                        style={{ textAlign: 'left', paddingLeft: '2rem' }}
                        className="p-3"
                      >
                        <input
                          type="checkbox"
                          onChange={() => handleCheckboxChange(apdetail.id)}
                          checked={selectedUsers.includes(apdetail.id)}
                        />
                      </td>
                      <td style={{ textAlign: 'left' }} className="p-3">
                        {apdetail.createdOn ? new Date(apdetail.createdOn).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'left' }} className="p-3">
                        {apdetail.name || 'N/A'}
                      </td>
                      <td className="p-3">{apdetail.email || 'N/A'}</td>
                      <td className="p-3">{apdetail.mobileNumber || 'N/A'}</td>
                      <td className="p-3">{apdetail.isKYC ? 'Yes' : 'No'}</td>
                      <td className="p-3">{apdetail.referralMode || 'N/A'}</td>
                      <td className="p-3">{apdetail.landingPageUrl || 'N/A'}</td>
                      <td className="p-3">
                        {apdetail.subscriptions && apdetail.subscriptions.length > 0
                          ? apdetail.subscriptions[0].RAname || 'N/A'
                          : 'N/A'}
                      </td>
                      <td className="p-3">
                        {apdetail.subscriptions && apdetail.subscriptions.length > 0 && apdetail.subscriptions[0].amount
                          ? `${apdetail.subscriptions[0].amount}`
                          : 'N/A'}
                      </td>
                      <td className="p-3">
                        {apdetail.subscriptions && apdetail.subscriptions.length > 0
                          ? apdetail.subscriptions[0].planType || 'N/A'
                          : 'N/A'}
                      </td>
                      <td className="p-3">
                        {apdetail.subscriptions && apdetail.subscriptions.length > 0
                          ? mapServiceType(apdetail.subscriptions[0].serviceType)
                          : 'N/A'}
                      </td>
                    </tr>
                    {hasMultipleSubscriptions &&
                      apdetail.subscriptions.slice(1).map((subscription, index) => (
                        <tr key={`${apdetail.id}-sub-${index}`} className="subscription-row">
                          <td></td> {/* Empty cells for alignment */}
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td className="p-3">{subscription.RAname || 'N/A'}</td>
                          <td className="p-3">{subscription.amount || 'N/A'}</td>
                          <td className="p-3">{subscription.planType || 'N/A'}</td>
                          <td className="p-3">{mapServiceType(subscription.serviceType) || 'N/A'}</td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" className="text-center p-3">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="pagination-controls mt-4 flex justify-center items-center">
        <button
          className="btn btn-primary mx-2"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-primary mx-2"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Show Popup */}
      {showPopup && (
        <CreateGroup
          selectedUsers={selectedUsers}
          closePopup={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default UserListing;
