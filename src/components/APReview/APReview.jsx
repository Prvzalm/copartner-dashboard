import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../Header/Header";
import { FaAngleLeft } from "react-icons/fa6";
import FirstAPComponent from "./FirstAPComponent.jsx";
import SecondAPComponent from "./SecondAPComponent.jsx";
import ThirdAPComponent from "./ThirdAPComponent.jsx";

const APReview = () => {
  const { onBoardAPId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNotification, setHasNotification] = useState(true);
  const navigate = useNavigate();
  return (
    <div className="dashboard-container p-0 sm:ml-60">
      <PageHeader
        title="A.P Onboarding"
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
        <FirstAPComponent handleNextStep={() => {}} onBoardAPId={onBoardAPId} />
        <SecondAPComponent handleNextStep={() => {}} onBoardAPId={onBoardAPId} />
        <ThirdAPComponent handleNextStep={() => {}} onBoardAPId={onBoardAPId} />
        {/* <FourthAPComponent handleNextStep={() => {}} onBoardAPId={onBoardAPId} />
        <FifthAPComponent handleNextStep={() => {}} onBoardAPId={onBoardAPId} /> */}
      </div>
    </div>
  );
};

export default APReview;
