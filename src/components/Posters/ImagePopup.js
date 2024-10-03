import React from "react";

const ImagePopup = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg w-full max-w-5xl h-3/4 flex flex-col">
        <button
          className="text-black self-end mb-2"
          onClick={onClose}
        >
          X
        </button>
        <div className="flex-grow overflow-auto">
          <img src={imageUrl} alt="Poster" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
};

export default ImagePopup;
