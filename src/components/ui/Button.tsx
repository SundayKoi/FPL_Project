import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-fpl-accent hover:bg-fpl-accent-hover text-white":
              variant === "primary",
            "bg-fpl-primary hover:bg-fpl-primary/80 text-white":
              variant === "secondary",
            "border-2 border-fpl-accent text-fpl-accent hover:bg-fpl-accent hover:text-white":
              variant === "outline",
            "text-fpl-muted hover:text-white hover:bg-fpl-primary/50":
              variant === "ghost",
            "bg-red-600 hover:bg-red-700 text-white": variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-base": size === "md",
            "px-8 py-3.5 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
