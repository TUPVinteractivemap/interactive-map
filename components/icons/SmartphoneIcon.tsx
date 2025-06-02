
import React from "react";

type SmartphoneIconProps = {
  className?: string;
  width?: number;
  height?: number;
  fill?: string;
  strokeColor?: string;
  strokeWidth?: number;
};

export const SmartphoneIcon = ({
  className = "",
  width = 384,
  height = 512,
  fill = "#4caf50",
  strokeColor = "#333",
  strokeWidth = 10
}: SmartphoneIconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 384 512" 
      width={width} 
      height={height}
      fill={fill}
      className={className}
    >
      <rect 
        x="42" 
        y="22" 
        width="300" 
        height="470" 
        rx="30" 
        ry="30" 
        fill="#fff" 
        stroke={strokeColor} 
        strokeWidth={strokeWidth}
      />
      <rect 
        x="62" 
        y="62" 
        width="260" 
        height="350" 
        fill="#ecf0f1" 
        stroke={strokeColor} 
        strokeWidth="2"
      />
      <circle 
        cx="192" 
        cy="450" 
        r="20" 
        fill="#ddd" 
        stroke={strokeColor} 
        strokeWidth="2"
      />
      <rect 
        x="172" 
        y="42" 
        width="40" 
        height="5" 
        rx="2" 
        ry="2" 
        fill="#555"
      />
    </svg>
  );
}; 