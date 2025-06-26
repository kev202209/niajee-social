"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  fullWidth = false,
  className = "",
  disabled,
  ...props 
}: ButtonProps) => {
  
  const baseStyles = "font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    outline: "border border-borderGray hover:border-iconBlue hover:bg-iconBlue/10 text-white",
    ghost: "hover:bg-blue-900/20 text-white"
  };
  
  const sizes = {
    sm: "py-1.5 px-3 text-xs",
    md: "py-2 px-4 text-sm",
    lg: "py-3 px-6 text-base"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  const buttonClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${widthClass}
    ${className}
  `.trim();

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;