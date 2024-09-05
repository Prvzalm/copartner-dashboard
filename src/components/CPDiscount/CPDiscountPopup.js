import { TextField } from "@mui/material";
import React, { useState } from "react";
import close from "../../assets/close.png";
import { v4 as uuidv4 } from 'uuid'; // Import the UUID library
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the datepicker styles

const CPDiscountPopup = ({ closeCPDiscount, fetchCPData }) => {
  const [discount, setDiscount] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(''); // New state for discount percentage
  const [validFrom, setValidFrom] = useState(null); // Initialize as null to show placeholder
  const [validTo, setValidTo] = useState(null); // Initialize as null to show placeholder

  const handleAddDiscount = async () => {
    const cpapId = uuidv4(); // Generate a new random UUID
    const referralMode = "CP"; // Default referral mode
    const couponCode = `${discount}`; // Generate the coupon code based on discount

    const payload = {
      cpapId,
      referralMode,
      couponCode,
      discountPercentage, // Use discountPercentage from the input
      discountValidFrom: validFrom,
      discountValidTo: validTo,
      isActive: true,
    };

    try {
      const response = await fetch('https://copartners.in:5009/api/RefferalCoupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Discount added successfully", responseData);
        fetchCPData(); // Fetch the updated data
        closeCPDiscount(); // Close the popup on success
      } else {
        console.error("Failed to add discount", responseData);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle input for the discount percentage, ensuring it's between 0 and 50
  const handleDiscountPercentageChange = (e) => {
    const value = e.target.value;

    // Ensure the input is a number and not greater than 50
    if (/^\d*$/.test(value)) { // Only allow digits
      const numericValue = parseInt(value, 10);

      if (numericValue <= 50 || value === "") {
        setDiscountPercentage(value); // Set the state only if the value is less than or equal to 50
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="popup bg-white border-1 border-[#ffffff2a] m-4 rounded-lg w-3/4 text-center">
        <div className="bg-[#dddddd] px-4 py-2 rounded-t-lg flex justify-between items-center">
          <h2 className="text-left font-semibold text-2xl">Add CP Discount</h2>
          <div className="flex items-center">
            <button onClick={closeCPDiscount}>
              <img className="w-8 h-8" src={close} alt="close" />
            </button>
          </div>
        </div>

        <form
          className="px-12 py-4 grid grid-cols-2 grid-rows-2 my-4 gap-8 text-left"
          onSubmit={(e) => {
            e.preventDefault(); // Prevent form from refreshing the page
            handleAddDiscount(); // Call the function to add the discount
          }}
        >
          <TextField
            id="Discount"
            name="discount"
            label="Discount Code"
            variant="outlined"
            fullWidth
            required
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />

          <TextField
            id="DiscountPercentage"
            name="discountPercentage"
            label="Discount Percentage"
            variant="outlined"
            fullWidth
            required
            value={discountPercentage}
            onChange={handleDiscountPercentageChange} // Handle the percentage change
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // Ensure only numbers can be entered
          />

          <DatePicker
            selected={validFrom}
            onChange={(date) => setValidFrom(date)}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Valid From"
            className="w-full px-4 py-2 rounded-md border border-gray-300"
          />

          <DatePicker
            selected={validTo}
            onChange={(date) => setValidTo(date)}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Valid To"
            className="w-full px-4 py-2 rounded-md border border-gray-300"
          />

          <button
            type="submit"
            className="col-span-2 px-12 bg-blue-500 text-white py-2 mb-8 border-2 rounded-lg"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default CPDiscountPopup;
