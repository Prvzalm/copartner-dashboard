import React, { useEffect, useState } from "react";
import PageHeader from "../Header/Header";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [onBoardingData, setOnBoardingData] = useState([]);
  const [activeButton, setActiveButton] = useState("button1");
  const navigate = useNavigate();

  const handleRAClick = (id) => {
    navigate(`${id}`);
  };

  const fetchOnboardingUser = async () => {
    const response = await fetch("https://copartners.in:5136/api/User");
    const data = await response.json();
    setOnBoardingData(data);
  };

  useEffect(() => {
    fetchOnboardingUser();
  }, []);

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
  };

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="Earnings"
        searchQuery=""
        setSearchQuery={() => {}}
        hasNotification={false}
        setHasNotification={() => {}}
      />

      <div className="px-4 flex gap-8">
        <button
          onClick={() => handleButtonClick("button1")}
          className={`px-16 py-4 border-2 rounded-xl ${
            activeButton === "button1" ? "border-black" : "border-gray-200"
          } font-semibold`}
        >
          R.A
        </button>
        <button
          onClick={() => handleButtonClick("button2")}
          className={`px-16 py-4 border-2 rounded-xl ${
            activeButton === "button2" ? "border-black" : "border-gray-200"
          } font-semibold`}
        >
          A.P
        </button>
      </div>

      <div className="p-4">
        <div className="dashboard-view-section mb-4">
          <div className="table-list-mb">
            <div className="py-4 px-8">
              <table className="table-list">
                <thead>
                  <tr>
                    <th>RA Name</th>
                    <th>Sebi Reg Number</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Company Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {onBoardingData.map((onboard) => (
                    <tr
                      onClick={() => handleRAClick(onboard.userId)}
                      key={onboard.userId}
                      className="even:bg-gray-100 odd:bg-white cursor-pointer"
                    >
                      <td>{onboard.fullName}</td>
                      <td>{onboard.sebiRegNumber}</td>
                      <td>{onboard.email}</td>
                      <td>{onboard.phoneNumber}</td>
                      <td>{onboard.companyName}</td>
                      <td className="text-[#F8961E]">{"Pending Action"}</td>
                      {console.log(onboard.userId)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
