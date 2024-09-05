import React, { useState, useEffect } from "react";
import { FaPen } from "react-icons/fa";
import Bin from "../../assets/TrashBinMinimalistic.png";
import Clip from "../../assets/Clipboard.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CPDiscountCP = ({fetchCPData, cpData, setCpData}) => {

  useEffect(() => {
    fetchCPData();
  }, []);

  const deleteCoupon = async (id) => {
    try {
      const response = await fetch(
        `https://copartners.in:5009/api/RefferalCoupon/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete coupon, status " + response.status);
      }

      // Update the state after deletion
      setCpData((prevData) => prevData.filter((item) => item.id !== id));
      toast.success("Coupon deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete coupon: ${error.message}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Coupon code copied to clipboard!");
    }).catch((err) => {
      toast.error("Failed to copy coupon code.");
      console.error("Failed to copy: ", err);
    });
  };

  return (
    <div className="p-4">
      <div className="dashboard-view-section mb-4">
        <div className="table-list-mb">
          <div className="py-4 px-8">
            <table className="table-list">
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingLeft: "2rem" }}>Date</th>
                  <th style={{ textAlign: "left" }}>Code</th>
                  <th>Discount</th>
                  <th>Valid to</th>
                  <th>Valid from</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cpData.length > 0 ? (
                  cpData.map((coupon) => (
                    <tr key={coupon.id}>
                      <td style={{ textAlign: "left", paddingLeft: "2rem" }}>
                        {new Date(coupon.createdOn).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "left" }}>{coupon.couponCode}</td>
                      <td>{coupon.discountPercentage}%</td>
                      <td>{new Date(coupon.discountValidTo).toLocaleDateString()}</td>
                      <td>{new Date(coupon.discountValidFrom).toLocaleDateString()}</td>
                      <td className="flex justify-center items-center gap-6">
                        <img
                          className="w-6 h-6 cursor-pointer"
                          src={Clip}
                          alt="Paste"
                          onClick={() => copyToClipboard(coupon.couponCode)}
                        />
                        <img
                          className="w-6 h-6 cursor-pointer"
                          src={Bin}
                          alt="Delete"
                          onClick={() => deleteCoupon(coupon.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CPDiscountCP;
