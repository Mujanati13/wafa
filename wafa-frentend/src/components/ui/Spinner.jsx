import React from "react";

const Spinner = ({ size = 40, color = "#2563eb", className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
      style={{ display: "block" }}
    >
      <circle
        cx="22"
        cy="22"
        r="20"
        stroke="#e5e7eb"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M42 22c0-11.046-8.954-20-20-20"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  </div>
);

export default Spinner;
