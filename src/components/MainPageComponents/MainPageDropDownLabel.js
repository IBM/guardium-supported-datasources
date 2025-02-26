import React from "react";
// import { Button } from "@mui/material";

export default function DropDownLabel({label}) {
  return (
    <label className="mainPageDropdownLabel">
      <span>
          {/* SVG Filter Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          {label}
        </span>
      
    </label>
  );
}




