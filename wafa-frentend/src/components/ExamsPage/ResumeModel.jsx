import React from "react";

const ResumeModel = () => {
  return (
      <div className="absolute  h-screen w-screen top-0 right-0 bg-black/50 text-white p-4   flex items-center justify-center ">
         <div className="w-full max-w-3xl h-[250px] bg-white border border-gray-300 rounded-3xl flex flex-col items-center justify-start relative shadow-md ">
        <button
          className="flex items-center gap-2 mt-6 px-4 py-1.5 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
        >
          <span className="text-blue-500 text-xl font-bold">+</span>
          <span className="text-sm">ajouter un resume</span>
        </button>
      </div>
      </div>
    
  );
};

export default ResumeModel;
