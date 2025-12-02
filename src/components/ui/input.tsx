import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={
          "flex h-10 w-full rounded-md border border-[#1a1a1a] bg-[#121212] px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#ff9900]/50 focus:border-[#ff9900] transition-colors disabled:opacity-50 disabled:cursor-not-allowed " +
          (className || "")
        }
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input }; 