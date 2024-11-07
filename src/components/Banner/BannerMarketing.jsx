// BannerMarketing.js

import React from 'react';
import Bin from "../../assets/TrashBinMinimalistic.png";
import { toast } from 'react-toastify';

const BannerMarketing = ({ banner, update }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`https://poster.copartner.in/api/banner/${banner._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete banner');
      }

      toast.success('Banner deleted successfully!');
      update();
    } catch (error) {
      console.error('Deleting error:', error);
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="bg-gray-100 rounded shadow-md flex flex-col items-center px-4 py-2">
      <div className="text-center flex items-center justify-between w-full">
        <div className="font-bold">
          {banner.name}
        </div>
        <div className="flex space-x-2">
          <button
            aria-label="Delete"
            className="focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={handleDelete}
          >
            <img
              className="w-6 h-6 cursor-pointer"
              src={Bin}
              alt="Delete"
            />
          </button>
        </div>
      </div>
      <div className="w-full h-full my-2">
        <img
          src={banner?.imageurl}
          alt={banner.name}
          className="w-full h-48 object-cover"
        />
      </div>
    </div>
  );
};

export default BannerMarketing;
