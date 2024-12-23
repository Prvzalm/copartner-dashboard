import React, { useEffect, useState } from "react";
import FirstComponent from "./FirstComponent";
import { FaAngleLeft } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../Header/Header";
import SecondComponent from "./SecondComponent";
import ThirdComponent from "./ThirdComponent";
import FourthComponent from "./FourthComponent";
import FifthComponent from "./FifthComponent";
import SixthComponent from "./SixthComponent";

const RAReview = () => {
  const { onBoardId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNotification, setHasNotification] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="R.A Onboarding"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setHasNotification={setHasNotification}
      />
      <div className="p-4">
        <div className="back-button flex items-center text-2xl font-bold p-6 justify-between">
          <button onClick={() => navigate(-1)}>
            <FaAngleLeft />
            <span className="ml-1">Back</span>
          </button>
        </div>

        {/* Render all components beneath each other */}
        <FirstComponent handleNextStep={() => {}} onBoardId={onBoardId} />
        <SecondComponent handleNextStep={() => {}} onBoardId={onBoardId} />
        <ThirdComponent handleNextStep={() => {}} onBoardId={onBoardId} />
        <FourthComponent handleNextStep={() => {}} onBoardId={onBoardId} />
        <FifthComponent handleNextStep={() => {}} onBoardId={onBoardId} />
        <SixthComponent handleNextStep={() => {}} onBoardId={onBoardId} />
      </div>
    </div>
  );
};

export default RAReview;
