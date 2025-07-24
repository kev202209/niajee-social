import React from "react";

export default function BufferingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div
          className="absolute inset-0 rounded-full border-4 border-t-4 border-solid animate-spin"
          style={{
            borderTopColor: "#6366f1",
            borderRightColor: "#06b6d4",
            borderBottomColor: "#22d3ee",
            borderLeftColor: "#f472b6",
            borderStyle: "solid",
            borderWidth: "4px",
          }}
        />
      </div>
    </div>
  );
}