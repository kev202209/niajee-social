import ReactDOM from "react-dom";
import React from "react";



// A simple portal component that renders its children in document.body
const DropdownMenuPortal: React.FC<{
  position: { top: number; left: number };
  children: React.ReactNode;
}> = ({ position, children }) => {
  return ReactDOM.createPortal(
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 1000,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownMenuPortal;