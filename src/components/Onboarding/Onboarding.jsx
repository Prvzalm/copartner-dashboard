import React, { useEffect, useState } from "react";
import PageHeader from "../Header/Header";

const Onboarding = () => {
  const [onBoardingData, setOnBoardingData] = useState([]);

  const fetchOnboardingUser = async () => {
    const response = await fetch("https://copartners.in:5136/api/User");
    const data = await response.json();
    console.log(data);
    setOnBoardingData(data);
  };

  useEffect(() => {
    fetchOnboardingUser();
  }, []);

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="Earnings"
        searchQuery=""
        setSearchQuery={() => {}}
        hasNotification={false}
        setHasNotification={() => {}}
      />

      <div className="p-4">
        <div className="dashboard-view-section mb-4">
          <div className="table-list-mb">
            <div className="py-4 px-8">
              <table className="table-list">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Phone Number</th>
                    <th>Sebi Reg Number</th>
                    <th>User Id</th>
                  </tr>
                </thead>
                <tbody>
                  {onBoardingData.map((onboard) => (
                    <tr className="bg-gray-100">
                      <td className="text-blue-600 font-bold">
                        {onboard.companyName}
                      </td>
                      <td className="text-green-600 font-bold">
                        {onboard.email}
                      </td>
                      <td className="text-green-600 font-bold">
                        {onboard.fullName}
                      </td>
                      <td className="text-green-600 font-bold">
                        {onboard.phoneNumber}
                      </td>
                      <td className="text-green-600 font-bold">
                        {onboard.sebiRegNumber}
                      </td>
                      <td className="text-green-600 font-bold">
                        {onboard.userId}
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
  );
};

export default Onboarding;
