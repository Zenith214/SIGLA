"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
        return (
            <div className="relative inline-flex items-center">
                <input
                    type="checkbox"
                    ref={ref}
                    id={id}
                    checked={checked}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    disabled={disabled}
                    className="sr-only"
                    {...props}
                />
                <div
                    className={cn(
                        "h-4 w-4 shrink-0 rounded-sm border border-gray-300 bg-white",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        checked && "bg-blue-600 border-blue-600 text-white",
                        "cursor-pointer transition-colors",
                        className
                    )}
                    onClick={() => !disabled && onCheckedChange?.(!checked)}
                >
                    {checked && (
                        <Check className="h-3 w-3 text-white m-0.5" strokeWidth={3} />
                    )}
                </div>
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";

export { Checkbox }