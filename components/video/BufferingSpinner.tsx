// import React from "react";

// export default function BufferingSpinner() {
//   return (
//     <div className="flex items-center justify-center">
//       <div className="w-16 h-16 relative">
//         <div className="absolute inset-0 rounded-full border-4 border-t-4 border-solid border-gray-200" />
//         <div
//           className="absolute inset-0 rounded-full border-4 border-t-4 border-solid animate-spin
//             border-gradient"
//         />
//         <style jsx>{`
//           .border-gradient {
//             border-top-color: #6366f1;
//             border-right-color: #06b6d4;
//             border-bottom-color: #22d3ee;
//             border-left-color: #f472b6;
//             /* You can add more colors or adjust as you like */
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// }




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