import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageHeader from "../Header/Header";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdDeleteOutline } from 'react-icons/md';

const MiniSub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNotification, setHasNotification] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('https://copartners.in:5009/api/Subscription')
      .then(response => {
        if (response.data.isSuccess) {
          const filteredData = response.data.data.filter(sub => sub.isSpecialSubscription && sub.experts.isCoPartner);
          setSubscriptions(filteredData);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        toast.error('Error fetching data');
      });
  };

  const handleDelete = (id) => {
    axios.delete(`https://copartners.in:5009/api/Subscription/${id}`)
      .then(response => {
        if (response.data.isSuccess) {
          toast.success('Subscription deleted successfully');
          setSubscriptions(subscriptions.filter(sub => sub.id !== id));
        } else {
          toast.error('Failed to delete subscription');
        }
      })
      .catch(error => {
        console.error('Error deleting subscription:', error);
        toast.error('Error deleting subscription');
      });
  };

  const getExpertType = (typeId) => {
    switch (parseInt(typeId)) {
      case 1:
        return "Commodity";
      case 2:
        return "Equity";
      case 3:
        return "Options";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="MiniSub Details"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setHasNotification={setHasNotification}
      />

      <div className="p-4">
        <div className="dashboard-view-section mb-4">
          <div className="table-list-mb">
            <div className="channel-heading flex">
              <h3 className="text-xl font-semibold mr-auto">Minor Subscription Listing</h3>
              {/* <button
                className="border-2 border-black rounded-lg px-4 py-1 mr-4"
                aria-label="Add new MiniSub detail"
              >
                + Add
              </button> */}
            </div>
            <div className="py-4 px-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#e5e5e5]">
                    <tr>
                      <th className="px-6 py-3 text-left uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left uppercase tracking-wider">RA Name</th>
                      <th className="px-6 py-3 text-left uppercase tracking-wider">Service Type</th>
                      <th className="px-6 py-3 text-left uppercase tracking-wider">Plan Type</th>
                      <th className="px-6 py-3 text-left uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(sub.createdOn).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.experts.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getExpertType(sub.experts.expertTypeId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.planType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.durationMonth} Days</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹ {sub.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="hover:scale-110 transition-transform duration-200"
                          >
                            <MdDeleteOutline className="text-red-600 text-xl cursor-pointer" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MiniSub;
