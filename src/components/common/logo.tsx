import { Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export function Logo({ className, size = 24, animated = false }: LogoProps) {
  return (
    <Crosshair
      className={cn(
        "text-primary",
        animated && "animate-spin-slow",
        className
      )}
      size={size}
    />
  );
}
