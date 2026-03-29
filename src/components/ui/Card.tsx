import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass-card p-6",
        hover && "hover:border-fpl-accent/50 hover:shadow-lg hover:shadow-fpl-accent/10 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
